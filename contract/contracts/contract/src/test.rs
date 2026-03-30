#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env, Address, String};

    // ── Test 1: Happy Path ────────────────────────────────────
    // Organizer mints a ticket → attendee wallet now has a valid ticket
    #[test]
    fn test_mint_and_verify_ticket() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EventPassContract);
        let client = EventPassContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let attendee = Address::generate(&env);

        // Initialize contract with admin
        client.initialize(&admin);

        // Admin mints a ticket to attendee
        client.mint_ticket(&attendee, &String::from_str(&env, "Ateneo Tech Event 2026"));

        // Verify attendee now holds a valid ticket
        let is_valid = client.verify_ticket(&attendee);
        assert!(is_valid, "Attendee should have a valid ticket after minting");
    }

    // ── Test 2: Edge Case ─────────────────────────────────────
    // Clawback revokes ticket — attendee can no longer enter
    #[test]
    fn test_clawback_invalidates_ticket() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EventPassContract);
        let client = EventPassContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let attendee = Address::generate(&env);

        client.initialize(&admin);
        client.mint_ticket(&attendee, &String::from_str(&env, "Ateneo Tech Event 2026"));

        // Confirm ticket is valid before clawback
        assert!(client.verify_ticket(&attendee), "Should be valid before clawback");

        // Admin clawbacks the ticket (fraud/refund scenario)
        client.clawback(&attendee);

        // Ticket should now be invalid
        let is_valid = client.verify_ticket(&attendee);
        assert!(!is_valid, "Ticket should be invalid after clawback");
    }

    // ── Test 3: State Verification ────────────────────────────
    // After minting, total ticket count should be correct
    #[test]
    fn test_total_tickets_count() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EventPassContract);
        let client = EventPassContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let attendee1 = Address::generate(&env);
        let attendee2 = Address::generate(&env);

        client.initialize(&admin);

        // Mint 2 tickets to 2 different attendees
        client.mint_ticket(&attendee1, &String::from_str(&env, "Ateneo Tech Event 2026"));
        client.mint_ticket(&attendee2, &String::from_str(&env, "Ateneo Tech Event 2026"));

        // Contract storage should reflect 2 total tickets issued
        let total = client.total_tickets();
        assert_eq!(total, 2, "Total tickets should be 2 after minting twice");
    }
}