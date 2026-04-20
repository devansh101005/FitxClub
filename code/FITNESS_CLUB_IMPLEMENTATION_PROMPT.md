# Fitness Club Management System — Java Implementation Prompt

> **Purpose:** This document is a self-contained prompt for Claude. Feed it at the start of each phase to get working, incremental code. By the end of Phase 4, every feature in the SRS is implemented.

---

## Project Overview

A large metropolitan fitness club needs a web-based system to manage memberships, QR-based access control, class/court reservations, café billing, renewals, and analytics reporting. The system serves five user roles: **Member, Receptionist, Trainer, Club Manager, System Admin** and integrates with external **Payment Gateway** and **SMS/Email** services.

---

## Recommended Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Language** | Java 17+ | LTS, records, sealed classes, pattern matching |
| **Framework** | Spring Boot 3.x | Production-grade, massive ecosystem, auto-config |
| **Web/REST** | Spring Web MVC | REST controllers, exception handling, validation |
| **Security** | Spring Security 6 + JWT (jjwt library) | Role-based access control (RBAC), stateless auth |
| **Persistence** | Spring Data JPA + Hibernate 6 | Repository pattern, auditing, specifications |
| **Database** | PostgreSQL 15+ | JSONB, partitioning, robust concurrent access |
| **Migration** | Flyway | Versioned SQL migrations, repeatable scripts |
| **Validation** | Jakarta Bean Validation (Hibernate Validator) | Declarative DTO validation |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) | Auto-generated interactive API docs |
| **QR Code** | ZXing (com.google.zxing) | QR generation and decoding |
| **Email** | Spring Boot Starter Mail + Thymeleaf templates | HTML email notifications |
| **SMS** | Twilio SDK (or Spring REST to SMS gateway) | SMS notifications |
| **Payments** | Razorpay Java SDK | Indian payment gateway integration |
| **Caching** | Spring Cache + Caffeine (or Redis for prod) | Capacity caching, session data |
| **Scheduling** | Spring `@Scheduled` | Renewal reminders, report generation |
| **Reporting** | JasperReports or Apache POI | PDF/Excel export |
| **Testing** | JUnit 5 + Mockito + Testcontainers | Unit, integration, DB tests |
| **Build** | Maven or Gradle (Kotlin DSL) | Dependency management |
| **Containerization** | Docker + Docker Compose | PostgreSQL, Redis, app container |
| **Frontend (optional)** | Thymeleaf server-rendered OR separate React SPA | Start with Thymeleaf for speed, migrate later |

---

## High-Level System Design (HLD)

### Architecture Style
Modular monolith with clean package boundaries. Each business domain is a separate top-level package that could be extracted into a microservice later.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│   Browser (Thymeleaf SSR)  ·  Mobile (REST API)  ·  QR Scanner  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────────────┐
│                     API GATEWAY / CONTROLLER LAYER               │
│  Spring Security Filter Chain → JWT Auth → Role-based routing    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      SERVICE LAYER (Business Logic)              │
│  ┌────────────┐ ┌───────────┐ ┌────────────┐ ┌──────────────┐  │
│  │ Membership │ │  Access   │ │Reservation │ │   Billing    │  │
│  │  Module    │ │  Control  │ │  Module    │ │   Module     │  │
│  └────────────┘ └───────────┘ └────────────┘ └──────────────┘  │
│  ┌────────────┐ ┌───────────┐ ┌────────────┐                   │
│  │  Renewal   │ │ Reporting │ │   Admin    │                   │
│  │  Module    │ │  Module   │ │   Module   │                   │
│  └────────────┘ └───────────┘ └────────────┘                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    REPOSITORY / DATA LAYER                       │
│          Spring Data JPA  ·  Flyway Migrations                   │
│                     PostgreSQL 15+                                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                          │
│    Razorpay API  ·  Twilio/SMS Gateway  ·  SMTP Email Service    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Stateless Auth (JWT):** No server-side sessions. Access token (15 min) + Refresh token (7 days). Roles embedded in JWT claims.
2. **Event-Driven Notifications:** Use Spring ApplicationEvents internally. `NotificationService` listens and dispatches via email/SMS asynchronously (`@Async`).
3. **QR as Membership Identifier:** QR encodes a signed JWT-like token containing `memberId` + `expiryDate`. Validated on scan without DB call for speed (< 2s SRS requirement).
4. **Capacity as Cached State:** Real-time occupancy stored in an in-memory cache (Caffeine) backed by DB. Atomic increment/decrement on entry/exit.
5. **Audit Trail:** JPA entity listeners auto-populate `createdBy`, `createdAt`, `updatedBy`, `updatedAt` on all entities.

---

## Low-Level System Design (LLD)

### Package Structure

```
com.fitnessclub
├── FitnessClubApplication.java
├── config/
│   ├── SecurityConfig.java          # Spring Security + JWT filter chain
│   ├── JwtTokenProvider.java        # Token generation, validation, claims extraction
│   ├── CacheConfig.java             # Caffeine cache beans
│   ├── AsyncConfig.java             # @Async thread pool config
│   └── OpenApiConfig.java           # Swagger grouping
├── common/
│   ├── BaseEntity.java              # id, createdAt, updatedAt, createdBy (mapped superclass)
│   ├── ApiResponse.java             # Uniform response wrapper
│   ├── GlobalExceptionHandler.java  # @ControllerAdvice
│   └── Constants.java
├── membership/
│   ├── controller/MemberController.java
│   ├── controller/MemberAdminController.java
│   ├── dto/RegisterRequest.java, MemberResponse.java, ...
│   ├── entity/Member.java
│   ├── entity/MembershipType.java   # Enum: MONTHLY, QUARTERLY, ANNUAL
│   ├── entity/AccessLevel.java      # Enum: GYM_ONLY, GYM_POOL, ALL_FACILITIES
│   ├── entity/MembershipStatus.java # Enum: ACTIVE, EXPIRED, CANCELLED
│   ├── repository/MemberRepository.java
│   ├── service/MemberService.java
│   └── service/QrCodeService.java   # ZXing generate + validate
├── auth/
│   ├── controller/AuthController.java
│   ├── dto/LoginRequest.java, TokenResponse.java
│   ├── entity/UserAccount.java      # email, passwordHash, role, linked memberId/staffId
│   ├── entity/Role.java             # Enum: MEMBER, RECEPTIONIST, TRAINER, MANAGER, ADMIN
│   ├── repository/UserAccountRepository.java
│   └── service/AuthService.java
├── access/
│   ├── controller/AccessController.java
│   ├── dto/ScanRequest.java, AccessResponse.java
│   ├── entity/AccessLog.java        # memberId, facilityId, entryTime, exitTime, status
│   ├── repository/AccessLogRepository.java
│   └── service/AccessControlService.java  # scan, validate, capacity check, log
├── facility/
│   ├── controller/FacilityController.java
│   ├── entity/Facility.java         # name, type, maxCapacity, currentOccupancy, isOpen
│   ├── repository/FacilityRepository.java
│   └── service/FacilityService.java # capacity management, open/close
├── reservation/
│   ├── controller/ReservationController.java
│   ├── dto/BookClassRequest.java, BookCourtRequest.java, ...
│   ├── entity/ClassSession.java     # className, date, startTime, endTime, capacity, trainerId
│   ├── entity/Booking.java          # memberId, sessionId, slotDate, status
│   ├── entity/BookingStatus.java    # Enum: CONFIRMED, WAITLISTED, CANCELLED, NO_SHOW
│   ├── repository/ClassSessionRepository.java
│   ├── repository/BookingRepository.java
│   └── service/ReservationService.java  # book, cancel, waitlist promotion
├── billing/
│   ├── controller/BillingController.java
│   ├── dto/PurchaseRequest.java, ReceiptResponse.java
│   ├── entity/PurchaseItem.java
│   ├── entity/Transaction.java      # amount, method, status, timestamp
│   ├── repository/TransactionRepository.java
│   ├── repository/PurchaseItemRepository.java
│   └── service/BillingService.java
├── payment/
│   ├── controller/PaymentWebhookController.java
│   ├── dto/PaymentCallbackDto.java
│   ├── service/PaymentGatewayService.java   # Razorpay create order, verify signature
│   └── service/RefundService.java
├── notification/
│   ├── event/NotificationEvent.java
│   ├── listener/NotificationListener.java   # @EventListener + @Async
│   ├── service/EmailService.java
│   └── service/SmsService.java
├── promotion/
│   ├── entity/Promotion.java        # code, discountType, value, validFrom, validUntil
│   ├── repository/PromotionRepository.java
│   └── service/PromotionService.java
├── renewal/
│   ├── controller/RenewalController.java
│   ├── service/RenewalService.java          # renew, calculate loyalty discount
│   └── scheduler/RenewalReminderScheduler.java  # @Scheduled cron
├── reporting/
│   ├── controller/ReportController.java
│   ├── dto/UtilizationReport.java, RevenueReport.java, ...
│   ├── service/ReportService.java
│   └── scheduler/MonthlyReportScheduler.java
└── admin/
    ├── controller/AdminController.java
    ├── dto/UserRoleRequest.java, PricingConfigRequest.java, ...
    └── service/AdminService.java
```

### Entity-Relationship Model (Database)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────────┐
│ user_account │       │    member    │       │    staff         │
├──────────────┤  1:1  ├──────────────┤       ├──────────────────┤
│ id (PK)      │◄─────►│ id (PK)      │       │ id (PK)          │
│ email        │       │ first_name   │       │ name             │
│ password_hash│       │ last_name    │       │ email            │
│ role         │       │ email        │       │ phone            │
│ member_id FK │       │ phone        │       │ role (enum)      │
│ staff_id FK  │       │ membership_  │       │ specialization   │
│ is_active    │       │   type       │       └──────────────────┘
│ created_at   │       │ access_level │
└──────────────┘       │ status       │    ┌─────────────────┐
                       │ start_date   │    │   facility      │
                       │ expiry_date  │    ├─────────────────┤
                       │ qr_code      │    │ id (PK)         │
                       │ created_at   │    │ name            │
                       └──────┬───────┘    │ type (enum)     │
                              │            │ max_capacity    │
                 ┌────────────┼────────────│ current_occ.    │
                 │            │            │ is_open         │
                 ▼            ▼            └────────┬────────┘
        ┌──────────────┐  ┌──────────┐             │
        │  transaction │  │ booking  │    ┌────────▼────────┐
        ├──────────────┤  ├──────────┤    │  access_log     │
        │ id           │  │ id       │    ├─────────────────┤
        │ member_id FK │  │ member_id│    │ id              │
        │ amount       │  │ session_ │    │ member_id FK    │
        │ total_amount │  │   id FK  │    │ facility_id FK  │
        │ payment_     │  │ slot_date│    │ entry_time      │
        │   method     │  │ start_   │    │ exit_time       │
        │ status       │  │   time   │    │ access_status   │
        │ timestamp    │  │ status   │    └─────────────────┘
        └──────────────┘  └──────────┘

  ┌───────────────┐  ┌────────────────┐  ┌────────────────┐
  │ class_session  │  │ purchase_item  │  │  promotion     │
  ├───────────────┤  ├────────────────┤  ├────────────────┤
  │ id            │  │ id             │  │ id             │
  │ class_name    │  │ transaction_id │  │ promo_code     │
  │ date          │  │ item_name      │  │ discount_type  │
  │ start_time    │  │ item_category  │  │ discount_value │
  │ end_time      │  │ quantity       │  │ valid_from     │
  │ capacity      │  │ unit_price     │  │ valid_until    │
  │ trainer_id FK │  └────────────────┘  └────────────────┘
  │ facility_id FK│
  └───────────────┘

  ┌────────────────┐
  │  notification  │
  ├────────────────┤
  │ id             │
  │ recipient_id   │
  │ type           │
  │ channel        │
  │ message        │
  │ sent_time      │
  │ status         │
  └────────────────┘
```

### Key API Endpoints (REST)

| Method | Path | Role(s) | Description |
|--------|------|---------|-------------|
| POST | `/api/auth/register` | PUBLIC | Member self-registration |
| POST | `/api/auth/login` | PUBLIC | Returns JWT access + refresh token |
| POST | `/api/auth/refresh` | PUBLIC | Refresh expired access token |
| GET | `/api/members/me` | MEMBER | View own membership details + QR |
| POST | `/api/members/register` | RECEPTIONIST | In-person registration |
| POST | `/api/access/scan` | MEMBER | QR scan entry/exit |
| GET | `/api/facilities` | ALL | List facilities with live occupancy |
| GET | `/api/classes/schedule` | ALL | View class schedule |
| POST | `/api/reservations/class` | MEMBER | Book a class |
| POST | `/api/reservations/court` | MEMBER | Book a court |
| GET | `/api/reservations/me` | MEMBER | View my reservations |
| DELETE | `/api/reservations/{id}` | MEMBER | Cancel reservation |
| POST | `/api/billing/purchase` | RECEPTIONIST | Café/merchandise purchase |
| POST | `/api/payments/create-order` | MEMBER | Create Razorpay order |
| POST | `/api/payments/webhook` | SYSTEM | Payment callback |
| POST | `/api/renewals` | MEMBER | Renew membership |
| GET | `/api/reports/utilization` | MANAGER | Facility utilization report |
| GET | `/api/reports/revenue` | MANAGER | Revenue report |
| GET | `/api/reports/footfall` | MANAGER | Daily footfall report |
| POST | `/api/admin/users` | ADMIN | Create/manage users & roles |
| PUT | `/api/admin/pricing` | ADMIN, MANAGER | Configure pricing |
| PUT | `/api/admin/facilities/{id}/capacity` | MANAGER | Set facility capacity |
| POST | `/api/admin/promotions` | MANAGER | Create promo codes |
| GET | `/api/trainer/schedule` | TRAINER | View assigned schedule |
| GET | `/api/trainer/attendees/{sessionId}` | TRAINER | View attendee list |

---

## Implementation Phases

---

### PHASE 1 — Foundation, Auth & Membership (Week 1–2)

**Goal:** Bootable application with DB schema, JWT authentication, RBAC, and full membership registration (online + in-person). Members get a QR code on registration.

#### What to Build

1. **Project Scaffolding**
   - Initialize Spring Boot 3.x project with dependencies: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `spring-boot-starter-mail`, `flyway-core`, `postgresql`, `jjwt`, `zxing-core`, `zxing-javase`, `springdoc-openapi-starter-webmvc-ui`, `caffeine`.
   - Docker Compose file with PostgreSQL 15 container.
   - `application.yml` with profiles (dev, prod), datasource, JWT secret, mail config.

2. **Common Infrastructure**
   - `BaseEntity` mapped superclass with `id` (UUID), `createdAt`, `updatedAt` (auto-populated via JPA `@PrePersist`/`@PreUpdate`).
   - `ApiResponse<T>` wrapper: `{ success: boolean, data: T, message: String, timestamp: Instant }`.
   - `GlobalExceptionHandler` with `@ControllerAdvice` handling `MethodArgumentNotValidException`, `EntityNotFoundException`, `AccessDeniedException`, custom `BusinessException`.

3. **Auth Module**
   - `UserAccount` entity with `email`, `passwordHash` (BCrypt), `role` enum, optional FK to `member` or `staff`.
   - `JwtTokenProvider`: generate access token (15 min, contains userId + role), refresh token (7 days), validate, extract claims.
   - `JwtAuthenticationFilter` extends `OncePerRequestFilter` — extracts token from `Authorization: Bearer` header, validates, sets `SecurityContextHolder`.
   - `SecurityConfig`: permit `/api/auth/**`, `/swagger-ui/**`; role-based rules for other paths.
   - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`.

4. **Membership Module**
   - `Member` entity with all fields from the class diagram: `memberId`, `firstName`, `lastName`, `email`, `phone`, `membershipType` (MONTHLY/QUARTERLY/ANNUAL), `accessLevel` (GYM_ONLY/GYM_POOL/ALL_FACILITIES), `membershipStatus` (ACTIVE/EXPIRED/CANCELLED), `startDate`, `expiryDate`, `qrCode`.
   - `MemberService.register()`: validate input, check facility capacity for chosen access level, create member, generate membership ID, generate QR code (via ZXing encoding memberId + expiry as signed payload), create linked `UserAccount`, publish `NotificationEvent`.
   - `QrCodeService`: generate QR as Base64 PNG, decode and validate signed payload.
   - `MemberController`: `POST /api/members/register` (RECEPTIONIST), `GET /api/members/me` (MEMBER), `GET /api/members/{id}` (MANAGER/ADMIN).
   - Self-registration via `POST /api/auth/register` that calls the same service.

5. **Notification Stub**
   - `NotificationEvent` with `recipientId`, `type` enum (REGISTRATION_CONFIRM, BOOKING_CONFIRM, etc.), `templateData` map.
   - `NotificationListener` with `@EventListener` that logs to console for now (email/SMS wired in Phase 3).

6. **Flyway Migrations**
   - `V1__create_user_account.sql`
   - `V2__create_member.sql`
   - `V3__create_staff.sql`
   - `V4__create_facility.sql` (seed data: Gym, Pool, Yoga Studio, Badminton Court, Squash Court, Café)
   - `V5__create_notification.sql`

7. **Data Seeding**
   - `V6__seed_data.sql`: default facilities with capacities, a default ADMIN user account, a MANAGER user, a sample RECEPTIONIST.

#### Deliverables
- Running app on `localhost:8080` with Swagger UI at `/swagger-ui.html`.
- A member can register, get a JWT, view their profile with QR code.
- Receptionist can register members on behalf of walk-ins.
- Role-based access enforced on all endpoints.
- Database migrations applied cleanly.

#### SRS Features Covered
`FR-MR1` through `FR-MR12` (Registration), `FR-AD1` (User role management basics), `SE-1` through `SE-8` (Security requirements).

---

### PHASE 2 — Access Control, Facilities & Reservations (Week 3–4)

**Goal:** Members can scan QR to enter/exit facilities with real-time capacity tracking. Class/court booking system with waitlist management.

#### What to Build

1. **Facility Module**
   - `Facility` entity: `id`, `name`, `facilityType` (GYM, POOL, YOGA_STUDIO, BADMINTON_COURT, SQUASH_COURT, CAFE), `maxCapacity`, `currentOccupancy`, `isOpen`.
   - `FacilityService`: `checkCapacity()`, `incrementOccupancy()` (atomic with optimistic locking `@Version`), `decrementOccupancy()`, `openFacility()`, `closeFacility()`.
   - Caffeine cache on `currentOccupancy` for fast reads.
   - `FacilityController`: `GET /api/facilities` (all, with live occupancy), `PUT /api/admin/facilities/{id}/capacity` (MANAGER).

2. **Access Control Module**
   - `AccessLog` entity: `memberId`, `facilityId`, `entryTime`, `exitTime`, `accessStatus` (GRANTED, DENIED_EXPIRED, DENIED_CAPACITY, DENIED_CLOSED, DENIED_ACCESS_LEVEL).
   - `AccessControlService.scan(qrPayload, facilityId, direction)`:
     - Decode QR → extract memberId + expiry.
     - If ENTRY: validate membership active + not expired → check access level matches facility type → check facility open → check capacity → increment occupancy → log entry → publish notification.
     - If EXIT: find open entry log → set exitTime → decrement occupancy.
     - Must complete within 2 seconds (SRS PR-3).
   - Overcrowding alert: if occupancy > 80% of capacity, publish `OVERCROWDING_ALERT` event (SRS FR-AC7).
   - `AccessController`: `POST /api/access/scan` — accepts `{ qrCode, facilityId, direction: ENTRY|EXIT }`.

3. **Class & Court Reservation Module**
   - `ClassSession` entity: `className`, `date`, `startTime`, `endTime`, `capacity`, `trainerId` (FK to staff), `facilityId`.
   - `Booking` entity: `memberId`, `classSessionId`, `slotDate`, `startTime`, `status` (CONFIRMED, WAITLISTED, CANCELLED, NO_SHOW).
   - `ReservationService`:
     - `bookClass(memberId, sessionId)`: check membership active → check slot availability → if available, confirm and reserve → else add to waitlist → publish notification.
     - `bookCourt(memberId, facilityId, date, startTime)`: similar flow for courts.
     - `cancelReservation(bookingId)`: cancel → promote first waitlisted member → notify.
     - `getMyReservations(memberId)`: return all upcoming bookings.
   - Waitlist: ordered by `createdAt`. On cancellation, auto-promote next waitlisted → set status to CONFIRMED → notify.
   - `ReservationController`: `POST /api/reservations/class`, `POST /api/reservations/court`, `GET /api/reservations/me`, `DELETE /api/reservations/{id}`.

4. **Trainer Endpoints**
   - `GET /api/trainer/schedule` — returns class sessions assigned to the logged-in trainer.
   - `GET /api/trainer/attendees/{sessionId}` — returns list of confirmed members for a session.

5. **Admin: Schedule Management**
   - `POST /api/admin/classes` — create/update class sessions (MANAGER).
   - `PUT /api/admin/facilities/{id}/status` — open/close facility (MANAGER).

6. **Flyway Migrations**
   - `V7__create_access_log.sql`
   - `V8__create_class_session.sql`
   - `V9__create_booking.sql`

#### Deliverables
- QR scan entry/exit working with capacity enforcement.
- Real-time facility occupancy visible.
- Members can book classes and courts, cancel, and see waitlist position.
- Trainers can view their schedule and attendee lists.
- Overcrowding alerts fire at 80% threshold.

#### SRS Features Covered
`FR-AC1` through `FR-AC10` (Access Control), `FR-RS1` through `FR-RS11` (Reservations), `FR-AD4` through `FR-AD6` (Facility & schedule admin).

---

### PHASE 3 — Payments, Billing, Renewals & Notifications (Week 5–6)

**Goal:** Full payment lifecycle with Razorpay, café/merchandise billing, membership renewal with loyalty discounts, and live email/SMS notifications.

#### What to Build

1. **Payment Module**
   - `PaymentGatewayService`: integrate with Razorpay Java SDK.
     - `createOrder(amount, currency, receiptId)` → returns Razorpay `orderId`.
     - `verifyPaymentSignature(orderId, paymentId, signature)` → validates webhook authenticity.
   - `PaymentWebhookController`: `POST /api/payments/webhook` — Razorpay sends payment confirmation → verify signature → update `Transaction` status → trigger downstream action (registration complete / renewal complete).
   - `Transaction` entity: `memberId`, `amount`, `totalAmount` (with GST), `paymentMethod`, `paymentStatus` (PENDING/SUCCESS/FAILED/REFUNDED), `razorpayOrderId`, `razorpayPaymentId`, `transactionTime`.
   - `RefundService`: calculate prorated refund for mid-term cancellations, initiate via Razorpay refund API.

2. **Promotion Module**
   - `Promotion` entity: `promoCode`, `discountType` (PERCENTAGE/FLAT), `discountValue`, `validFrom`, `validUntil`, `usageLimit`, `currentUsage`.
   - `PromotionService.validateAndApply(promoCode, baseAmount)` → returns discounted amount or throws if invalid/expired/exhausted.
   - `POST /api/admin/promotions` (MANAGER) — create promo codes.
   - Applied during registration and renewal.

3. **Billing Module (Café & Merchandise)**
   - `PurchaseItem` entity: `transactionId`, `itemName`, `itemCategory`, `quantity`, `unitPrice`.
   - `BillingService`:
     - `createPurchase(memberId, items[])`: scan member QR → create line items → calculate total with GST → create Transaction → add to member's outstanding balance.
     - `guestCheckout(items[])`: standalone cash/card transaction for non-members.
   - `BillingController`: `POST /api/billing/purchase` (RECEPTIONIST), `GET /api/billing/member/{id}/balance` (MEMBER/RECEPTIONIST).
   - Receipt generation: return a structured `ReceiptResponse` DTO (or PDF via JasperReports).

4. **Renewal Module**
   - `RenewalService`:
     - `calculateLoyaltyDiscount(memberId)`: based on tenure (months active) and visit frequency.
     - `renew(memberId, newPlan, promoCode?)`: validate grace period → calculate price with loyalty + promo discounts → create Razorpay order → on payment success, extend `expiryDate`, set status ACTIVE.
   - `RenewalReminderScheduler`: `@Scheduled(cron = "0 0 9 * * *")` — daily at 9 AM, find members expiring in 14/7/1 days → publish `RENEWAL_REMINDER` notification events.
   - Auto-disable: when membership expires and grace period lapses, set status to EXPIRED, disable access (SRS FR-RN6).
   - `RenewalController`: `POST /api/renewals` (MEMBER), `POST /api/renewals/in-person` (RECEPTIONIST).
   - Add-on packages: allow upgrading access level during renewal (e.g., add pool access).

5. **Notification Module (Live)**
   - Wire up `EmailService` using Spring Mail + Thymeleaf HTML templates for: registration confirmation, booking confirmation, renewal reminder, overcrowding alert, waitlist promotion.
   - Wire up `SmsService` via Twilio REST API for critical notifications (renewal reminders, access denied).
   - `Notification` entity persists all sent notifications for audit.
   - `NotificationListener` dispatches asynchronously via `@Async`.

6. **Cancellation Flow**
   - `POST /api/members/me/cancel` (MEMBER): check outstanding café balance → if balance > 0, require settlement first (SRS FR-RN10) → calculate prorated refund → initiate refund → set status CANCELLED → disable access.

7. **Flyway Migrations**
   - `V10__create_transaction.sql`
   - `V11__create_purchase_item.sql`
   - `V12__create_promotion.sql`
   - `V13__add_outstanding_balance_to_member.sql`

#### Deliverables
- Razorpay payment flow end-to-end (create order → checkout → webhook → confirm).
- Café purchases linked to member accounts.
- Membership renewal with loyalty discounts and promo codes.
- Automated renewal reminders (14/7/1 day before expiry).
- Email and SMS notifications live.
- Cancellation with refund processing.

#### SRS Features Covered
`FR-MR7`, `FR-MR8` (Promo code + Payment), `FR-CB1` through `FR-CB8` (Billing), `FR-RN1` through `FR-RN10` (Renewal/Cancellation), `FR-AD2`, `FR-AD3`, `FR-AD10` (Pricing & promos).

---

### PHASE 4 — Reporting, Analytics, Admin & Polish (Week 7)

**Goal:** Management reporting with export, full admin panel, audit logs, and production hardening.

#### What to Build

1. **Reporting Module**
   - `ReportService`:
     - `facilityUtilization(dateRange)`: query `access_log` → calculate % utilization per facility (SRS FR-RP1).
     - `dailyFootfall(date)`: count entries per facility per day (FR-RP2).
     - `peakVsOffPeak(dateRange)`: group entries by hour → classify peak (6–9AM, 5–8PM) vs off-peak → return chart data (FR-RP3).
     - `revenueByMembership(dateRange)`: aggregate transactions by membership type (FR-RP4).
     - `revenueByCafe(dateRange)`: aggregate café/merchandise transactions (FR-RP5).
     - `combinedRevenue(dateRange)`: membership + café + merchandise totals (FR-RP6).
     - `overcrowdingTrends(dateRange)`: frequency and duration of 80%+ occupancy events (FR-RP7).
     - `membershipGrowth(dateRange)`: new registrations vs renewals vs cancellations (FR-RP8).
   - Export endpoints: `GET /api/reports/{type}?format=json|pdf|excel|csv` (MANAGER).
   - PDF export via JasperReports or Apache PDFBox.
   - Excel/CSV export via Apache POI.
   - `MonthlyReportScheduler`: auto-generate and email monthly reports to manager on the 1st of each month.

2. **Real-Time Dashboard API**
   - `GET /api/dashboard/live` (MANAGER): returns current occupancy per facility, active members count, today's footfall, today's revenue, upcoming classes, alerts.
   - Endpoint designed to be polled every 30s by frontend (or use SSE for real-time push).

3. **Full Admin Module**
   - `POST /api/admin/users` — create staff accounts with roles (FR-AD1).
   - `PUT /api/admin/users/{id}/role` — change user roles.
   - `DELETE /api/admin/users/{id}` — deactivate user.
   - `PUT /api/admin/pricing` — configure membership pricing by type and duration (FR-AD2).
   - `PUT /api/admin/facilities/{id}/schedule` — manage class/court time slots (FR-AD5).
   - `PUT /api/admin/notifications/templates` — customize notification templates (FR-AD7).
   - `GET /api/admin/audit-log` — paginated audit log of all system activities (FR-AD8).
   - `POST /api/admin/backup` — trigger database backup (FR-AD9).
   - `PUT /api/admin/pricing/seasonal` — seasonal pricing adjustments (FR-AD10).

4. **Audit Log**
   - `AuditLog` entity: `userId`, `action`, `entityType`, `entityId`, `oldValue` (JSON), `newValue` (JSON), `timestamp`, `ipAddress`.
   - JPA entity listener or Spring AOP aspect that auto-logs CREATE/UPDATE/DELETE on sensitive entities (Member, Transaction, Facility config, UserAccount).

5. **No-Show Tracking**
   - `NoShowScheduler`: runs after each class session ends → check bookings with status CONFIRMED where member didn't scan in → mark as NO_SHOW (FR-RS11).
   - Repeated no-shows could trigger warnings (configurable).

6. **Production Hardening**
   - Rate limiting on auth endpoints (Spring `@RateLimiter` or bucket4j).
   - Account lockout after 5 failed login attempts (SE-8).
   - Session timeout config: 30 min inactivity (SE-5).
   - HTTPS enforcement (SE-2).
   - CORS configuration for frontend origins.
   - Health check endpoint: `GET /actuator/health`.
   - Request/response logging with correlation IDs.
   - Database indexing: composite indexes on `access_log(member_id, entry_time)`, `booking(member_id, status)`, `transaction(member_id, payment_status)`.

7. **Flyway Migrations**
   - `V14__create_audit_log.sql`
   - `V15__create_pricing_config.sql`
   - `V16__add_indexes.sql`

#### Deliverables
- All 10 report types working with PDF/Excel/CSV export.
- Real-time dashboard API for management.
- Complete admin panel with user management, pricing config, audit logs.
- No-show tracking.
- Production-ready security hardening.
- Full Swagger documentation for all endpoints.

#### SRS Features Covered
`FR-RP1` through `FR-RP10` (Reporting), `FR-AD1` through `FR-AD10` (Admin), `FR-RS11` (No-show), all NFRs: `PR-1` to `PR-5`, `SF-1` to `SF-3`, `SE-1` to `SE-8`, `AV-1`, `SC-1`, `MT-1`, `MT-2`, `US-1`, `US-2`.

---

## Phase Summary Matrix

| Phase | Modules | Key SRS Sections | Estimated Time |
|-------|---------|-------------------|----------------|
| 1 — Foundation | Auth, Membership, QR, Notification stub | Registration (FR-MR), Security (SE) | 2 weeks |
| 2 — Access & Reservations | Access Control, Facility, Reservations, Trainer | Access Control (FR-AC), Reservations (FR-RS) | 2 weeks |
| 3 — Payments & Billing | Payment, Billing, Renewal, Promotions, Notifications | Billing (FR-CB), Renewal (FR-RN), Pricing (FR-AD2/3) | 2 weeks |
| 4 — Reports & Admin | Reporting, Dashboard, Admin, Audit, Hardening | Reporting (FR-RP), Admin (FR-AD), all NFRs | 1 week |

---

## How to Use This Document

1. **Start a new Claude conversation for each phase.** Paste this entire document as context, then say: *"Implement Phase N. Generate all Java source files, Flyway migrations, Docker Compose, and application.yml. Use the package structure and entity design specified in the LLD."*
2. **Each phase builds on the previous.** Phase 2 assumes Phase 1 entities and auth infrastructure exist.
3. **Test incrementally.** After each phase, verify via Swagger UI and write integration tests with Testcontainers.
4. **Frontend is decoupled.** All functionality is exposed via REST APIs. Add a React or Thymeleaf frontend at any point.

---

## Reference Artifacts

The following documents from the original project informed this spec:
- **Problem Statement** — original fitness club requirements narrative
- **SRS Document (v1.0)** — 70+ functional requirements across 7 modules, plus NFRs
- **Use Case Document** — 5 detailed use cases (UC-01 to UC-05) with actors, preconditions, alternate flows
- **Use Case Diagram** — 6 actors, 20+ use cases with include/extend relationships
- **Class Diagram** — 14 classes with attributes, methods, and associations
- **Sequence Diagrams** — "Book Class Reservation" and "Access Facility via QR" interaction flows
- **Data Dictionary** — 11 data categories with full decomposition in standard notation
- **DFD** — multi-level data flow diagrams showing process interactions
