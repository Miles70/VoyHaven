# Recoverable operational reset

Admin → Operasyon ayarları → Test verilerini sıfırla offers a bounded preview, explicit booking selection (including an explicit paid-test flag), all-analytics reset, optional full operational reset and restore controls.

All routes are mounted behind existing password-admin authentication and no-store responses. Preview data contains no payment secrets or archive contents. Mutations use a MongoDB transaction: unsupported standalone MongoDB fails without partial writes. Snapshots expire after one hour; changed or processing bookings reject the operation. Activity newer than the preview cutoff stays active.

Bookings and analytics retain their original rows, unique indexes and immutable IDs with archivedAt/archiveBatch. Query/aggregation middleware excludes them from active application reads and counters. Restore removes the archive flags. Retaining booking transaction hashes also preserves replay protection.

Optional full reset archives and removes Customer, TravelAccount, TravelSupportTicket, TravelBookingNote and old TravelAdminAudit rows. Customer sessions and challenges are revoked; they are not restored, and users authenticate afresh. An archive batch and a new reset audit record remain. Restore reinserts archived operational documents and restores bookings/analytics in one transaction. Unique-key conflicts (for example a customer re-registered after reset) abort the whole restore, leaving its archive intact for conflict resolution.

Admin sessions/password, hotel index/translations, website content, site settings and provider credentials remain intact. This operation never calls provider cancellation, refund or payment APIs. It resets this application's local operational data, not provider-side records or external identity providers.

## Per-visitor analytics removal

Every visitor card in analytics has Sil → Evet, ziyaretçiyi sil (or Vazgeç). It archives only the exact visitorId's analytics up to the deletion timestamp, across all dates, sessions and traffic types regardless of current report filters. Booking/customer records remain untouched. Counters, country/source breakdowns and CSV reflect active events after refresh. A visitor is not blocked: future events can appear again.

The analytics panel's Silinen ziyaretçiler list shows the latest 25 outstanding visitor-removal batches and provides persistent restore controls. The operation uses the existing admin-only transaction/archive/restore mechanism; the general reset view also retains access to older batches. No removal is executed as part of deployment.
