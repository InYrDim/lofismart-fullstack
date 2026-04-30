# LofishMart — Later / Deferred Features

> These features are acknowledged but intentionally out of scope for now.
> Revisit when core POS + inventory is stable and in production.

---

## Delivery Module

From the owner meeting. This is essentially a **separate product** bolted onto the fish market app. Estimated effort is 3-4x everything built so far.

### What was requested

| Feature | Description |
|---|---|
| Sistem antri pengantaran | Delivery queue — orders go into a queue, couriers pick them up in order |
| Jarak | Distance calculation from outlet to customer location |
| Transfer | Handoff between couriers or between outlets |
| WA terintegrasi | WhatsApp Business API integration — notify customer when order is out for delivery, delivered, etc. |
| Tarif per kilometer | Delivery fee calculated per km based on distance |
| Kurir role | New role: courier who sees and manages delivery queue |

### Why it's deferred

- Requires geolocation/maps API (Google Maps or similar) — new external dependency
- WhatsApp Business API has its own setup, approval process, and cost
- Delivery queue is a separate domain with its own state machine (pending → picked up → in transit → delivered → failed)
- None of this can be half-built — a partial delivery system is worse than no delivery system
- Core POS + inventory isn't fully done yet

### When to revisit

- Core inventory flow is working end-to-end
- POS is stable in production
- Client explicitly confirms delivery is the next priority and budget/timeline is agreed
- Dedicated sprint planned for delivery module only

### Rough scope when ready

1. Customer address + location on Member profile
2. Delivery order entity (linked to Selling)
3. Courier role + mobile-friendly courier view
4. Distance calculation (integrate maps API)
5. Fee calculation (tarif/km × distance)
6. Queue system (FIFO or priority-based)
7. WhatsApp notification triggers (on create, on dispatch, on delivery)
8. Delivery status tracking
