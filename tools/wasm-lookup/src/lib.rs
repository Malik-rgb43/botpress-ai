use std::collections::HashMap;
use wasm_bindgen::prelude::*;

/// Fast in-memory business index for O(1) lookups.
///
/// Maintains three HashMaps:
/// - whatsapp_phone_id -> business_id
/// - email_address -> business_id
/// - widget_domain -> business_id
///
/// Used by BotPress AI inbound routes to replace O(n) `select('*')` scans.
#[wasm_bindgen]
pub struct BusinessIndex {
    phone_to_biz: HashMap<String, String>,
    email_to_biz: HashMap<String, String>,
    domain_to_biz: HashMap<String, String>,
    // Reverse index: business_id -> (phone_ids, emails, domains)
    biz_keys: HashMap<String, BizKeys>,
}

/// Tracks which keys belong to a business (for removal).
struct BizKeys {
    phone_ids: Vec<String>,
    emails: Vec<String>,
    domains: Vec<String>,
}

#[wasm_bindgen]
impl BusinessIndex {
    /// Create a new empty BusinessIndex.
    #[wasm_bindgen(constructor)]
    pub fn new() -> BusinessIndex {
        BusinessIndex {
            phone_to_biz: HashMap::new(),
            email_to_biz: HashMap::new(),
            domain_to_biz: HashMap::new(),
            biz_keys: HashMap::new(),
        }
    }

    /// Add a business to all applicable indexes.
    ///
    /// Pass empty string or skip for channels the business doesn't use.
    /// - `business_id`: required, unique identifier
    /// - `phone_id`: WhatsApp phone ID (optional, pass "" to skip)
    /// - `email`: email address (optional, pass "" to skip)
    /// - `domain`: widget domain (optional, pass "" to skip)
    #[wasm_bindgen]
    pub fn add_business(
        &mut self,
        business_id: &str,
        phone_id: &str,
        email: &str,
        domain: &str,
    ) -> Result<(), JsError> {
        if business_id.is_empty() {
            return Err(JsError::new("business_id cannot be empty"));
        }

        // Remove existing entries for this business first (supports updates)
        self.remove_business(business_id);

        let mut keys = BizKeys {
            phone_ids: Vec::new(),
            emails: Vec::new(),
            domains: Vec::new(),
        };

        if !phone_id.is_empty() {
            self.phone_to_biz
                .insert(phone_id.to_string(), business_id.to_string());
            keys.phone_ids.push(phone_id.to_string());
        }

        if !email.is_empty() {
            let normalized = email.to_lowercase();
            self.email_to_biz
                .insert(normalized.clone(), business_id.to_string());
            keys.emails.push(normalized);
        }

        if !domain.is_empty() {
            let normalized = domain.to_lowercase();
            self.domain_to_biz
                .insert(normalized.clone(), business_id.to_string());
            keys.domains.push(normalized);
        }

        self.biz_keys.insert(business_id.to_string(), keys);

        Ok(())
    }

    /// Add multiple businesses at once from a JSON array.
    ///
    /// Expects JSON: `[{"id":"...", "phone_id":"...", "email":"...", "domain":"..."}, ...]`
    /// All fields except `id` are optional.
    #[wasm_bindgen]
    pub fn bulk_load(&mut self, json_array: &str) -> Result<u32, JsError> {
        let entries: Vec<BulkEntry> = serde_json::from_str(json_array)
            .map_err(|e| JsError::new(&format!("Invalid JSON: {}", e)))?;

        let mut count = 0u32;
        for entry in &entries {
            self.add_business(
                &entry.id,
                entry.phone_id.as_deref().unwrap_or(""),
                entry.email.as_deref().unwrap_or(""),
                entry.domain.as_deref().unwrap_or(""),
            )?;
            count += 1;
        }

        Ok(count)
    }

    /// Remove a business from all indexes.
    #[wasm_bindgen]
    pub fn remove_business(&mut self, business_id: &str) {
        if let Some(keys) = self.biz_keys.remove(business_id) {
            for phone_id in &keys.phone_ids {
                self.phone_to_biz.remove(phone_id);
            }
            for email in &keys.emails {
                self.email_to_biz.remove(email);
            }
            for domain in &keys.domains {
                self.domain_to_biz.remove(domain);
            }
        }
    }

    /// Look up a business_id by WhatsApp phone ID. Returns empty string if not found.
    #[wasm_bindgen]
    pub fn lookup_by_phone(&self, phone_id: &str) -> String {
        self.phone_to_biz
            .get(phone_id)
            .cloned()
            .unwrap_or_default()
    }

    /// Look up a business_id by email address. Case-insensitive.
    #[wasm_bindgen]
    pub fn lookup_by_email(&self, email: &str) -> String {
        self.email_to_biz
            .get(&email.to_lowercase())
            .cloned()
            .unwrap_or_default()
    }

    /// Look up a business_id by widget domain. Case-insensitive.
    #[wasm_bindgen]
    pub fn lookup_by_domain(&self, domain: &str) -> String {
        self.domain_to_biz
            .get(&domain.to_lowercase())
            .cloned()
            .unwrap_or_default()
    }

    /// Returns JSON with the count of entries in each index.
    /// Example: `{"phone_entries":5,"email_entries":3,"domain_entries":2,"total_businesses":5}`
    #[wasm_bindgen]
    pub fn stats(&self) -> String {
        serde_json::json!({
            "phone_entries": self.phone_to_biz.len(),
            "email_entries": self.email_to_biz.len(),
            "domain_entries": self.domain_to_biz.len(),
            "total_businesses": self.biz_keys.len(),
        })
        .to_string()
    }

    /// Check if a business exists in the index.
    #[wasm_bindgen]
    pub fn has_business(&self, business_id: &str) -> bool {
        self.biz_keys.contains_key(business_id)
    }
}

/// Internal struct for bulk_load JSON deserialization.
#[derive(serde::Deserialize)]
struct BulkEntry {
    id: String,
    phone_id: Option<String>,
    email: Option<String>,
    domain: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_and_lookup() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "phone-abc", "test@example.com", "example.com")
            .unwrap();

        assert_eq!(idx.lookup_by_phone("phone-abc"), "biz-1");
        assert_eq!(idx.lookup_by_email("test@example.com"), "biz-1");
        assert_eq!(idx.lookup_by_domain("example.com"), "biz-1");
    }

    #[test]
    fn test_case_insensitive_email() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "", "Test@Example.COM", "")
            .unwrap();

        assert_eq!(idx.lookup_by_email("test@example.com"), "biz-1");
        assert_eq!(idx.lookup_by_email("TEST@EXAMPLE.COM"), "biz-1");
    }

    #[test]
    fn test_case_insensitive_domain() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "", "", "Example.COM")
            .unwrap();

        assert_eq!(idx.lookup_by_domain("example.com"), "biz-1");
    }

    #[test]
    fn test_optional_fields() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "phone-only", "", "").unwrap();

        assert_eq!(idx.lookup_by_phone("phone-only"), "biz-1");
        assert_eq!(idx.lookup_by_email("anything"), "");
        assert_eq!(idx.lookup_by_domain("anything"), "");
    }

    #[test]
    fn test_remove_business() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "phone-abc", "test@example.com", "example.com")
            .unwrap();

        idx.remove_business("biz-1");

        assert_eq!(idx.lookup_by_phone("phone-abc"), "");
        assert_eq!(idx.lookup_by_email("test@example.com"), "");
        assert_eq!(idx.lookup_by_domain("example.com"), "");
        assert!(!idx.has_business("biz-1"));
    }

    #[test]
    fn test_update_business() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "old-phone", "old@test.com", "old.com")
            .unwrap();
        idx.add_business("biz-1", "new-phone", "new@test.com", "new.com")
            .unwrap();

        // Old keys should be gone
        assert_eq!(idx.lookup_by_phone("old-phone"), "");
        assert_eq!(idx.lookup_by_email("old@test.com"), "");

        // New keys should work
        assert_eq!(idx.lookup_by_phone("new-phone"), "biz-1");
        assert_eq!(idx.lookup_by_email("new@test.com"), "biz-1");
    }

    #[test]
    fn test_bulk_load() {
        let mut idx = BusinessIndex::new();
        let json = r#"[
            {"id": "biz-1", "phone_id": "phone-1", "email": "a@test.com"},
            {"id": "biz-2", "email": "b@test.com", "domain": "b.com"},
            {"id": "biz-3", "phone_id": "phone-3"}
        ]"#;

        let count = idx.bulk_load(json).unwrap();
        assert_eq!(count, 3);
        assert_eq!(idx.lookup_by_phone("phone-1"), "biz-1");
        assert_eq!(idx.lookup_by_email("b@test.com"), "biz-2");
        assert_eq!(idx.lookup_by_domain("b.com"), "biz-2");
        assert_eq!(idx.lookup_by_phone("phone-3"), "biz-3");
    }

    #[test]
    fn test_stats() {
        let mut idx = BusinessIndex::new();
        idx.add_business("biz-1", "phone-1", "a@test.com", "a.com")
            .unwrap();
        idx.add_business("biz-2", "", "b@test.com", "").unwrap();

        let stats: serde_json::Value = serde_json::from_str(&idx.stats()).unwrap();
        assert_eq!(stats["phone_entries"], 1);
        assert_eq!(stats["email_entries"], 2);
        assert_eq!(stats["domain_entries"], 1);
        assert_eq!(stats["total_businesses"], 2);
    }

    #[test]
    fn test_empty_business_id_error() {
        let mut idx = BusinessIndex::new();
        assert!(idx.add_business("", "phone", "email", "domain").is_err());
    }

    #[test]
    fn test_not_found_returns_empty() {
        let idx = BusinessIndex::new();
        assert_eq!(idx.lookup_by_phone("nonexistent"), "");
        assert_eq!(idx.lookup_by_email("nonexistent"), "");
        assert_eq!(idx.lookup_by_domain("nonexistent"), "");
    }
}
