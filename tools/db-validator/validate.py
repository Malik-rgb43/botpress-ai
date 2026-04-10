#!/usr/bin/env python3
"""
BotPress AI — Supabase Schema Validator

Validates that supabase-schema.sql contains the expected tables, columns,
RLS policies, indexes, and foreign keys for the BotPress AI application.

Usage:
    python validate.py
    python validate.py --schema ../../supabase-schema.sql
"""

import re
import sys
import os
from pathlib import Path

# ── ANSI Colors ──────────────────────────────────────────────────────────────

GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"


def pass_msg(msg: str) -> str:
    return f"  {GREEN}PASS{RESET}  {msg}"


def warn_msg(msg: str) -> str:
    return f"  {YELLOW}WARN{RESET}  {msg}"


def fail_msg(msg: str) -> str:
    return f"  {RED}FAIL{RESET}  {msg}"


# ── Schema Parser ────────────────────────────────────────────────────────────

def parse_schema(sql: str) -> dict:
    """Parse SQL schema into structured data using regex."""
    schema = {
        "tables": {},        # table_name -> list of column dicts
        "rls_enabled": set(),
        "rls_policies": {},  # table_name -> list of policy names
        "indexes": [],       # list of raw index statements
        "foreign_keys": [],  # list of (table, column, ref_table, ref_column)
    }

    # ── Parse CREATE TABLE blocks ────────────────────────────────────────
    table_pattern = re.compile(
        r"create\s+table\s+(?:public\.)?(\w+)\s*\((.*?)\);",
        re.IGNORECASE | re.DOTALL,
    )
    for match in table_pattern.finditer(sql):
        table_name = match.group(1)
        body = match.group(2)
        columns = []

        for line in body.split("\n"):
            line = line.strip().rstrip(",")
            if not line or line.startswith("--"):
                continue
            # Match column definitions (starts with a word, has a type)
            col_match = re.match(
                r'^"?(\w+)"?\s+(uuid|text|integer|boolean|numeric[\w(),]*|timestamptz|jsonb)',
                line,
                re.IGNORECASE,
            )
            if col_match:
                col_name = col_match.group(1)
                col_type = col_match.group(2).lower()
                columns.append({"name": col_name, "type": col_type})

                # Check for foreign keys inline
                fk_match = re.search(
                    r"references\s+(?:public\.)?(\w+)\((\w+)\)",
                    line,
                    re.IGNORECASE,
                )
                if fk_match:
                    schema["foreign_keys"].append(
                        (table_name, col_name, fk_match.group(1), fk_match.group(2))
                    )

        schema["tables"][table_name] = columns

    # ── Parse RLS enabled ────────────────────────────────────────────────
    rls_pattern = re.compile(
        r"alter\s+table\s+(?:public\.)?(\w+)\s+enable\s+row\s+level\s+security",
        re.IGNORECASE,
    )
    for match in rls_pattern.finditer(sql):
        schema["rls_enabled"].add(match.group(1))

    # ── Parse RLS policies ───────────────────────────────────────────────
    policy_pattern = re.compile(
        r'create\s+policy\s+"([^"]+)"\s+on\s+(?:public\.)?(\w+)',
        re.IGNORECASE,
    )
    for match in policy_pattern.finditer(sql):
        policy_name = match.group(1)
        table_name = match.group(2)
        schema["rls_policies"].setdefault(table_name, []).append(policy_name)

    # ── Parse indexes ────────────────────────────────────────────────────
    index_pattern = re.compile(
        r"create\s+index\s+(?:if\s+not\s+exists\s+)?(\w+)\s+on\s+(?:public\.)?(\w+)\(([^)]+)\)",
        re.IGNORECASE,
    )
    for match in index_pattern.finditer(sql):
        schema["indexes"].append({
            "name": match.group(1),
            "table": match.group(2),
            "columns": match.group(3).strip(),
        })

    return schema


# ── Validators ───────────────────────────────────────────────────────────────

EXPECTED_TABLES = [
    "users", "businesses", "faqs", "policies", "response_templates",
    "conversations", "messages", "customers",
    "summary_settings", "escalations", "unanswered_questions",
    "plans", "subscriptions", "widget_settings",
]

EXPECTED_INDEXES = [
    ("conversations", "business_id"),
    ("messages", "conversation_id"),
    ("faqs", "business_id"),
]


def validate(schema: dict) -> tuple[int, int, int]:
    """Run all validation checks. Returns (passed, warnings, failures)."""
    passed = 0
    warnings = 0
    failures = 0

    def ok(msg):
        nonlocal passed
        passed += 1
        print(pass_msg(msg))

    def warn(msg):
        nonlocal warnings
        warnings += 1
        print(warn_msg(msg))

    def fail(msg):
        nonlocal failures
        failures += 1
        print(fail_msg(msg))

    # ── 1. All expected tables exist ─────────────────────────────────────
    print(f"\n{BOLD}[1/10] Expected tables{RESET}")
    for table in EXPECTED_TABLES:
        if table in schema["tables"]:
            ok(f"Table '{table}' exists")
        else:
            fail(f"Table '{table}' is MISSING")

    # ── 2. Each table has an id column (uuid) ────────────────────────────
    print(f"\n{BOLD}[2/10] Primary key 'id' column (uuid){RESET}")
    for table in EXPECTED_TABLES:
        if table not in schema["tables"]:
            continue
        columns = schema["tables"][table]
        id_col = next((c for c in columns if c["name"] == "id"), None)
        if id_col and id_col["type"] == "uuid":
            ok(f"'{table}.id' is uuid")
        elif id_col:
            warn(f"'{table}.id' exists but type is '{id_col['type']}', expected uuid")
        else:
            fail(f"'{table}' has no 'id' column")

    # ── 3. Foreign keys reference valid tables ───────────────────────────
    print(f"\n{BOLD}[3/10] Foreign key references{RESET}")
    all_tables = set(schema["tables"].keys()) | {"auth.users", "users"}
    for table, col, ref_table, ref_col in schema["foreign_keys"]:
        # auth.users is a Supabase built-in, always valid
        if ref_table in all_tables or ref_table == "auth":
            ok(f"'{table}.{col}' -> '{ref_table}.{ref_col}'")
        else:
            fail(f"'{table}.{col}' references unknown table '{ref_table}'")

    # ── 4. RLS enabled on all tables ─────────────────────────────────────
    print(f"\n{BOLD}[4/10] Row Level Security enabled{RESET}")
    for table in EXPECTED_TABLES:
        if table in schema["rls_enabled"]:
            ok(f"RLS enabled on '{table}'")
        else:
            fail(f"RLS NOT enabled on '{table}'")

    # ── 5. Each table has at least one RLS policy ────────────────────────
    print(f"\n{BOLD}[5/10] RLS policies defined{RESET}")
    for table in EXPECTED_TABLES:
        policies = schema["rls_policies"].get(table, [])
        if len(policies) > 0:
            ok(f"'{table}' has {len(policies)} RLS polic{'y' if len(policies) == 1 else 'ies'}")
        else:
            fail(f"'{table}' has NO RLS policies")

    # ── 6-8. Required indexes ────────────────────────────────────────────
    print(f"\n{BOLD}[6-8/10] Required indexes{RESET}")
    for check_num, (table, col) in enumerate(EXPECTED_INDEXES, start=6):
        found = any(
            idx["table"] == table and col in idx["columns"]
            for idx in schema["indexes"]
        )
        if found:
            ok(f"Index on '{table}.{col}' exists")
        else:
            fail(f"Index on '{table}.{col}' is MISSING")

    # ── 9. businesses.contact_info is JSONB ──────────────────────────────
    print(f"\n{BOLD}[9/10] businesses.contact_info (JSONB){RESET}")
    if "businesses" in schema["tables"]:
        col = next(
            (c for c in schema["tables"]["businesses"] if c["name"] == "contact_info"),
            None,
        )
        if col and col["type"] == "jsonb":
            ok("'businesses.contact_info' is JSONB")
        elif col:
            warn(f"'businesses.contact_info' exists but type is '{col['type']}'")
        else:
            fail("'businesses.contact_info' column is MISSING")
    else:
        fail("'businesses' table not found — cannot check contact_info")

    # ── 10. widget_settings.primary_color exists ─────────────────────────
    print(f"\n{BOLD}[10/10] widget_settings.primary_color{RESET}")
    if "widget_settings" in schema["tables"]:
        col = next(
            (c for c in schema["tables"]["widget_settings"] if c["name"] == "primary_color"),
            None,
        )
        if col:
            ok(f"'widget_settings.primary_color' exists (type: {col['type']})")
        else:
            fail("'widget_settings.primary_color' column is MISSING")
    else:
        fail("'widget_settings' table not found — cannot check primary_color")

    return passed, warnings, failures


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Resolve schema path
    if len(sys.argv) > 2 and sys.argv[1] == "--schema":
        schema_path = Path(sys.argv[2])
    else:
        # Default: two levels up from tools/db-validator/
        schema_path = Path(__file__).resolve().parent.parent.parent / "supabase-schema.sql"

    print(f"{BOLD}BotPress AI — Schema Validator{RESET}")
    print(f"{DIM}Schema: {schema_path}{RESET}")

    if not schema_path.exists():
        print(f"\n{RED}ERROR: Schema file not found at {schema_path}{RESET}")
        sys.exit(1)

    sql = schema_path.read_text(encoding="utf-8")
    schema = parse_schema(sql)

    print(f"\n{DIM}Found {len(schema['tables'])} tables, "
          f"{len(schema['rls_enabled'])} with RLS enabled, "
          f"{sum(len(v) for v in schema['rls_policies'].values())} policies, "
          f"{len(schema['indexes'])} indexes{RESET}")

    passed, warnings, failures = validate(schema)

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n{'-' * 50}")
    parts = [
        f"{GREEN}{passed} passed{RESET}",
        f"{YELLOW}{warnings} warnings{RESET}" if warnings else None,
        f"{RED}{failures} failures{RESET}" if failures else None,
    ]
    summary = " | ".join(p for p in parts if p)
    print(f"  {BOLD}Summary:{RESET} {summary}")
    print()

    sys.exit(1 if failures > 0 else 0)


if __name__ == "__main__":
    main()
