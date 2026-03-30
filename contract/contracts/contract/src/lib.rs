#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol, Vec,
};

// ─── Storage Keys ────────────────────────────────────────────
const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const TICKETS_KEY: Symbol = symbol_short!("TICKETS");

// ─── Data Types ──────────────────────────────────────────────

/// Represents a single ticket on-chain
#[contracttype]
#[derive(Clone)]
pub struct Ticket {
    pub owner: Address,       // Wallet address of the ticket holder
    pub event_name: String,   // Name of the event
    pub is_valid: bool,       // True = valid, False = clawed back
}

/// Contract entry point
#[contract]
pub struct EventPassContract;

#[contractimpl]
impl EventPassContract {

    /// Initialize the contract with an admin (the organizer)
    /// Must be called once after deployment
    pub fn initialize(env: Env, admin: Address) {
        // Prevent re-initialization
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);

        // Start with an empty ticket list
        let tickets: Vec<Ticket> = Vec::new(&env);
        env.storage().instance().set(&TICKETS_KEY, &tickets);
    }

    /// Mint a ticket to an attendee's wallet
    /// Only the admin (organizer) can call this
    pub fn mint_ticket(env: Env, attendee: Address, event_name: String) {
        // Only admin can mint tickets
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        // Create the new ticket
        let ticket = Ticket {
            owner: attendee,
            event_name,
            is_valid: true,
        };

        // Add to the ticket list
        let mut tickets: Vec<Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS_KEY)
            .unwrap_or(Vec::new(&env));
        tickets.push_back(ticket);
        env.storage().instance().set(&TICKETS_KEY, &tickets);
    }

    /// Verify if a wallet address holds a valid ticket
    /// Anyone (door checker) can call this — it's read-only
    pub fn verify_ticket(env: Env, attendee: Address) -> bool {
        let tickets: Vec<Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS_KEY)
            .unwrap_or(Vec::new(&env));

        // Loop through all tickets and check if this address has a valid one
        for ticket in tickets.iter() {
            if ticket.owner == attendee && ticket.is_valid {
                return true;
            }
        }
        false
    }

    /// Clawback (revoke) a ticket from an attendee
    /// Only the admin (organizer) can call this
    pub fn clawback(env: Env, attendee: Address) {
        // Only admin can clawback
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        let mut tickets: Vec<Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS_KEY)
            .unwrap_or(Vec::new(&env));

        // Find the attendee's ticket and mark it invalid
        let mut updated: Vec<Ticket> = Vec::new(&env);
        for ticket in tickets.iter() {
            if ticket.owner == attendee {
                // Mark as invalid (clawed back)
                updated.push_back(Ticket {
                    owner: ticket.owner,
                    event_name: ticket.event_name,
                    is_valid: false,
                });
            } else {
                updated.push_back(ticket);
            }
        }

        env.storage().instance().set(&TICKETS_KEY, &updated);
    }

    /// Get total number of tickets issued
    pub fn total_tickets(env: Env) -> u32 {
        let tickets: Vec<Ticket> = env
            .storage()
            .instance()
            .get(&TICKETS_KEY)
            .unwrap_or(Vec::new(&env));
        tickets.len()
    }
}