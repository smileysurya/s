# UniMart Platform Architecture

This document converts the 16-module idea into a build plan for the current React + Node + MongoDB project.

## 1. Real App Mapping

### B2B
- Apps: Alibaba, IndiaMART
- Why users use them: supplier discovery, RFQ, bulk sourcing, quote comparison
- Business model: lead fees, subscription plans, ads, transaction support
- Features to borrow:
  - RFQ inbox
  - supplier verification
  - quotation comparison
  - buyer-seller messaging

### ShopOffice
- Apps: MagicBricks, 99acres
- Why users use them: commercial property discovery, filtering, broker/owner inventory
- Business model: listing subscriptions, lead generation, premium placement
- Features to borrow:
  - listing filters
  - virtual tours
  - owner vs broker labels
  - locality intelligence

### Rental
- Apps: Airbnb, NoBroker
- Why users use them: booking, direct owner discovery, flexible inventory
- Business model: booking commission, premium services, listing boosts
- Features to borrow:
  - booking calendar
  - reviews and ratings
  - stay/rent request workflow
  - auto-generated rental paperwork

### Lease
- Apps: DocuSign
- Why users use them: trusted signature workflow, template reuse, secure storage
- Business model: seat-based SaaS, API and enterprise plans
- Features to borrow:
  - e-signature
  - reusable templates
  - audit trail
  - cloud storage links

### Agreement
- Apps: Zoho Sign
- Why users use them: multi-party signing, internal approvals, legal document tracking
- Business model: subscription SaaS, enterprise admin features
- Features to borrow:
  - multi-party workflow
  - template library
  - role-based sharing
  - legal lifecycle tracking

### Civil
- Apps: Urban Company
- Why users use them: service booking, transparent pricing, trust and scheduling
- Business model: commission on bookings, partner tools, add-on services
- Features to borrow:
  - contractor booking
  - estimate engine
  - work progress tracker
  - milestone payments

### Interior
- Apps: Livspace
- Why users use them: design inspiration, package pricing, designer consultation
- Business model: design-to-execution margin, service packages, consultations
- Features to borrow:
  - design catalog
  - package pricing
  - 3D preview
  - designer assignment

### Showcase
- Apps: Instagram, Pinterest
- Why users use them: visual discovery, inspiration, creator portfolios
- Business model: ads, creator/brand discovery, commerce
- Features to borrow:
  - image/video feed
  - likes and comments
  - saved collections
  - portfolio pages

### Dress
- Apps: Myntra
- Why users use them: merchandising, size guidance, returns
- Business model: margin on sales, brand ads, promotions
- Features to borrow:
  - strong filters
  - size charts
  - wishlist
  - try/return support

### Manpower
- Apps: QuikrJobs
- Why users use them: quick hiring, local talent, flexible labor discovery
- Business model: recruiter plans, lead fees, premium listings
- Features to borrow:
  - worker availability
  - daily wage hiring
  - shift assignment
  - attendance view

### JobPortal
- Apps: Naukri, LinkedIn
- Why users use them: jobs, recruiter sourcing, messaging, talent pipelines
- Business model: recruiter subscriptions, job posts, resume database access
- Features to borrow:
  - recruiter dashboard
  - resume upload
  - AI matching
  - recruiter-candidate messaging

### WelcomeKits
- Apps: Printo
- Why users use them: branded kits, customization, MOQ pricing
- Business model: product margin, design services, bulk order fulfillment
- Features to borrow:
  - custom kit builder
  - branding options
  - MOQ pricing
  - preview before order

### Bags
- Apps: Amazon
- Why users use them: broad category browsing, reviews, delivery trust
- Business model: transaction fees, ads, logistics services
- Features to borrow:
  - categories
  - reviews
  - logistics tracking
  - delivery ETA

### Leather
- Apps: Hidesign
- Why users use them: premium branding, craftsmanship, durable product storytelling
- Business model: premium margin, direct brand retail
- Features to borrow:
  - brand story
  - craftsmanship detail
  - premium catalog
  - limited collection drops

### Bulk
- Apps: Udaan
- Why users use them: wholesale rates, credit and distributor network
- Business model: marketplace commission, embedded finance, logistics
- Features to borrow:
  - tiered pricing
  - credit eligibility
  - distributor routes
  - MOQ-led checkout

### Procurement
- Apps: SAP Ariba
- Why users use them: vendor onboarding, PO lifecycle, sourcing governance
- Business model: enterprise SaaS, network fees, procurement stack
- Features to borrow:
  - vendor management
  - purchase orders
  - contract linkage
  - shipment/order tracking

## 2. Feature Breakdown

Each module should expose three layers.

### User Features
- search, filter, shortlist
- quote/request/order/booking
- payment and tracking
- document and history view

### Seller or Provider Features
- profile and KYC
- listing/service creation
- lead/order management
- analytics and payouts

### Admin Controls
- verification
- moderation
- dispute handling
- fee configuration
- fraud detection
- workflow overrides

## 3. Exact Implementation

### Global MongoDB Collections
- `users`
- `profiles`
- `kyc_verifications`
- `notifications`
- `payments`
- `transactions`
- `reviews`
- `conversations`
- `messages`
- `documents`
- `audit_logs`

### B2B
- DB:
  - `suppliers`
  - `b2b_products`
  - `rfqs`
  - `quotes`
  - `bulk_orders`
  - `price_tiers`
- APIs:
  - `POST /api/b2b/products`
  - `GET /api/b2b/products`
  - `POST /api/b2b/rfqs`
  - `GET /api/b2b/rfqs/:id/quotes`
  - `POST /api/b2b/orders`
  - `POST /api/b2b/conversations`
- Frontend:
  - `pages/B2B.jsx`
  - `components/ProductCatalog.jsx`
  - `components/RFQDrawer.jsx`
  - `components/QuoteComparisonTable.jsx`
  - `components/NegotiationChat.jsx`

### ShopOffice
- DB:
  - `property_listings`
  - `property_media`
  - `property_leads`
  - `brokers`
- APIs:
  - `GET /api/shopoffice/listings`
  - `POST /api/shopoffice/listings`
  - `GET /api/shopoffice/listings/:id`
  - `POST /api/shopoffice/leads`
  - `POST /api/shopoffice/virtual-tour`
- Frontend:
  - `pages/ShopOffice.jsx`
  - `components/PropertyFilters.jsx`
  - `components/PropertyCard.jsx`
  - `components/VirtualTourViewer.jsx`

### Rental
- DB:
  - `rental_units`
  - `booking_slots`
  - `rental_bookings`
  - `rental_reviews`
- APIs:
  - `GET /api/rental/units`
  - `POST /api/rental/bookings`
  - `GET /api/rental/calendar/:unitId`
  - `POST /api/rental/reviews`
- Frontend:
  - `pages/Rental.jsx`
  - `components/BookingCalendar.jsx`
  - `components/RentalCheckout.jsx`
  - `components/RentalReviewList.jsx`

### Lease
- DB:
  - `lease_templates`
  - `lease_documents`
  - `sign_requests`
  - `signature_events`
- APIs:
  - `GET /api/lease/templates`
  - `POST /api/lease/documents`
  - `POST /api/lease/sign`
  - `GET /api/lease/documents/:id/audit`
- Frontend:
  - `pages/Lease.jsx`
  - `components/LeaseTemplatePicker.jsx`
  - `components/SignerPanel.jsx`
  - `components/DocumentVault.jsx`

### Agreement
- DB:
  - `agreement_templates`
  - `agreements`
  - `agreement_participants`
  - `agreement_events`
- APIs:
  - `GET /api/agreements/templates`
  - `POST /api/agreements`
  - `POST /api/agreements/:id/participants`
  - `POST /api/agreements/:id/sign`
- Frontend:
  - `pages/Agreement.jsx`
  - `components/AgreementStepper.jsx`
  - `components/ParticipantTracker.jsx`
  - `components/LegalTimeline.jsx`

### Civil
- DB:
  - `civil_projects`
  - `contractor_profiles`
  - `estimates`
  - `project_milestones`
  - `site_updates`
- APIs:
  - `POST /api/civil/projects`
  - `POST /api/civil/estimate`
  - `GET /api/civil/projects/:id`
  - `POST /api/civil/projects/:id/milestones`
- Frontend:
  - `pages/Civil.jsx`
  - `components/EstimateBuilder.jsx`
  - `components/ContractorBoard.jsx`
  - `components/ProjectTimeline.jsx`

### Interior
- DB:
  - `design_packages`
  - `designers`
  - `consultations`
  - `design_previews`
- APIs:
  - `GET /api/interior/packages`
  - `POST /api/interior/consultations`
  - `GET /api/interior/designers`
  - `POST /api/interior/previews`
- Frontend:
  - `pages/Interior.jsx`
  - `components/DesignCatalog.jsx`
  - `components/PreviewGallery.jsx`
  - `components/DesignerBooking.jsx`

### Showcase
- DB:
  - `showcase_posts`
  - `showcase_comments`
  - `showcase_likes`
  - `collections`
- APIs:
  - `GET /api/showcase/feed`
  - `POST /api/showcase/posts`
  - `POST /api/showcase/:id/like`
  - `POST /api/showcase/:id/comment`
- Frontend:
  - `pages/Showcase.jsx`
  - `components/FeedGrid.jsx`
  - `components/PostModal.jsx`
  - `components/CollectionDrawer.jsx`

### Dress
- DB:
  - `fashion_products`
  - `size_charts`
  - `returns`
  - `wishlists`
- APIs:
  - `GET /api/dress/products`
  - `GET /api/dress/size-chart/:productId`
  - `POST /api/dress/orders`
  - `POST /api/dress/returns`
- Frontend:
  - `pages/Dress.jsx`
  - `components/SizeChartModal.jsx`
  - `components/ReturnRequestForm.jsx`
  - `components/FashionFilterPanel.jsx`

### Manpower
- DB:
  - `workers`
  - `worker_skills`
  - `availability_slots`
  - `job_assignments`
  - `attendance_logs`
- APIs:
  - `GET /api/manpower/workers`
  - `POST /api/manpower/hire`
  - `GET /api/manpower/availability`
  - `POST /api/manpower/attendance`
- Frontend:
  - `pages/Manpower.jsx`
  - `components/WorkerGrid.jsx`
  - `components/DailyWageCalculator.jsx`
  - `components/AvailabilityBoard.jsx`

### JobPortal
- DB:
  - `jobs`
  - `resumes`
  - `applications`
  - `match_scores`
  - `recruiter_projects`
- APIs:
  - `POST /api/jobs`
  - `GET /api/jobs`
  - `POST /api/jobs/apply`
  - `POST /api/jobs/resume-upload`
  - `GET /api/jobs/matches/:userId`
- Frontend:
  - `pages/JobPortal.jsx`
  - `components/ResumeUploader.jsx`
  - `components/JobMatchPanel.jsx`
  - `components/RecruiterPipeline.jsx`

### WelcomeKits
- DB:
  - `kit_templates`
  - `kit_components`
  - `branding_requests`
  - `kit_orders`
- APIs:
  - `GET /api/welcomekits/templates`
  - `POST /api/welcomekits/build`
  - `POST /api/welcomekits/orders`
  - `POST /api/welcomekits/branding`
- Frontend:
  - `pages/WelcomeKits.jsx`
  - `components/KitBuilder.jsx`
  - `components/BrandingOptions.jsx`
  - `components/QuantityPricingTable.jsx`

### Bags
- DB:
  - `bag_products`
  - `bag_reviews`
  - `shipment_events`
- APIs:
  - `GET /api/bags/products`
  - `POST /api/bags/orders`
  - `POST /api/bags/reviews`
  - `GET /api/bags/track/:orderId`
- Frontend:
  - `pages/Bags.jsx`
  - `components/BagCategoryNav.jsx`
  - `components/ReviewPanel.jsx`
  - `components/ShipmentTracker.jsx`

### Leather
- DB:
  - `leather_collections`
  - `craft_stories`
  - `premium_orders`
- APIs:
  - `GET /api/leather/collections`
  - `GET /api/leather/stories`
  - `POST /api/leather/orders`
- Frontend:
  - `pages/Leather.jsx`
  - `components/BrandStoryPanel.jsx`
  - `components/CollectionCarousel.jsx`
  - `components/PremiumCheckout.jsx`

### Bulk
- DB:
  - `bulk_products`
  - `bulk_price_tiers`
  - `credit_accounts`
  - `distributors`
- APIs:
  - `GET /api/bulk/products`
  - `POST /api/bulk/credit/check`
  - `POST /api/bulk/orders`
  - `GET /api/bulk/distributors`
- Frontend:
  - `pages/Bulk.jsx`
  - `components/TierPricingCard.jsx`
  - `components/CreditEligibilityPanel.jsx`
  - `components/DistributorMap.jsx`

### Procurement
- DB:
  - `vendors`
  - `purchase_orders`
  - `shipments`
  - `vendor_scores`
  - `contracts`
- APIs:
  - `GET /api/procurement/vendors`
  - `POST /api/procurement/purchase-orders`
  - `GET /api/procurement/track/:poId`
  - `POST /api/procurement/vendors/:id/score`
- Frontend:
  - `pages/Procurement.jsx`
  - `components/VendorScorecard.jsx`
  - `components/POTracker.jsx`
  - `components/ProcurementBoard.jsx`

## 4. Competitor Weaknesses and Better Solutions

### Top recurring weaknesses
- fake suppliers and fake jobs
- weak quote quality
- fragmented messaging
- poor trust indicators
- slow paperwork
- disconnected modules
- no milestone visibility
- bad payment recovery
- weak return/refund transparency
- poor admin tooling

### Our platform improvements
- KYC plus GST plus business email verification for sellers and recruiters
- quote normalization schema so all sellers respond in the same comparable format
- one conversation engine across modules
- trust badges based on KYC, delivery score, dispute score, and payment success
- document generation from booking/order context
- cross-module IDs linking products, services, contracts, labor, and jobs
- escrow or milestone release for service-heavy modules
- shared payments ledger for all modules
- standardized refunds table and refund state machine
- admin risk dashboard across all modules

## 5. Cross-Module Integration

### Main integrations
- Rental -> Lease -> Agreement
  - booking confirmed
  - lease document created
  - agreement packet generated
  - signature workflow starts

- B2B -> Bulk -> Procurement
  - RFQ accepted
  - bulk pricing selected
  - purchase order created
  - shipment tracking begins

- Civil -> Procurement -> Manpower
  - project estimate raises material demand
  - procurement creates vendor order
  - manpower schedules labor teams

- Interior -> Showcase
  - portfolio posts convert into consultation leads
  - liked projects become design inquiry starters

- JobPortal -> Manpower
  - permanent job flow for recruiter mode
  - short-term or daily labor flow for manpower mode

### Shared data contracts
- `tenantId`, `sellerId`, `buyerId`, `vendorId`, `projectId`, `documentId`, `paymentId`
- `moduleType` and `moduleRefId` on transactions, notifications, documents

## 6. Buyer vs Seller System

### Buyer journey
- app login
- choose module
- browse/search/filter
- request quote or book service
- pay
- track order/service/document

### Seller or provider journey
- register
- KYC verification
- choose module role
- create listing or service package
- receive leads/orders
- respond to chat, quote, or booking
- get paid and monitor performance

### Admin journey
- verify users and businesses
- review disputes
- monitor payments
- block fraud
- manage fees, templates, categories, and content

## 7. Payment Implementation

### Flow
- order created in `pending_payment`
- payment order created in Razorpay or Stripe
- client receives checkout session
- payment callback or webhook verifies signature
- payment stored in `payments`
- order moves to `paid`
- notifications sent to buyer and seller

### Payments collection
- `payments`
  - `_id`
  - `moduleType`
  - `moduleRefId`
  - `buyerId`
  - `sellerId`
  - `amount`
  - `currency`
  - `provider`
  - `providerOrderId`
  - `providerPaymentId`
  - `status`
  - `refundStatus`
  - `failureReason`
  - `createdAt`

### APIs
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/payments/refund`
- `GET /api/payments/:id`

### Failure handling
- keep `payment_attempts`
- mark order `payment_failed`
- allow retry with same cart/order reference
- webhook reconciliation job every few minutes

## 8. UI/UX Design

### Homepage
- 16 module grid
- category grouping
- quick search
- recent activity

### Buyer dashboard
- orders
- quotes
- bookings
- payments
- saved items
- contracts/documents

### Seller dashboard
- leads
- listings
- quote requests
- order pipeline
- earnings
- trust score

### Navigation
- top-level module switcher
- shared notifications
- shared conversation center
- shared payments and documents center

## 9. Build Better Than Competitors

### Unified problems and platform-level answers
- Problem: too many fake sellers
  - Fix: KYC, GST, business email, payout hold, trust badges
- Problem: fragmented chats
  - Fix: one inbox across all modules
- Problem: weak quote comparison
  - Fix: structured RFQ/quote schema
- Problem: painful legal docs
  - Fix: auto-generate docs from transactions
- Problem: bad delivery visibility
  - Fix: universal order and shipment timeline
- Problem: no buyer memory
  - Fix: shared profile, saved items, recent activity
- Problem: no seller operations center
  - Fix: common seller dashboard and analytics
- Problem: poor service trust
  - Fix: attendance, milestones, proofs, review evidence
- Problem: too many separate products
  - Fix: one platform identity with role-specific modules
- Problem: manual admin work
  - Fix: risk rules, moderation queues, document automation

## 10. Recommended Build Order

### Phase 1
- B2B
- Bulk
- Procurement

### Phase 2
- Civil
- Interior
- Manpower

### Phase 3
- JobPortal
- Rental
- ShopOffice
- Lease
- Agreement

### Phase 4
- Dress
- Bags
- Leather
- Showcase
- WelcomeKits

## Sources Used
- Alibaba RFQ and supplier operations overview: https://www.alibaba.com/product-insights/b2b-alibaba.html
- AliSupplier operational workbench: https://apps.apple.com/vg/app/alisupplier-app-for-alibaba/id708064914
- NoBroker product listing overview: https://apps.apple.com/us/app/nobroker-rent-buy-sell-flats/id1200507100
- DocuSign eSignature features: https://www.docusign.com/features-and-benefits
- Zoho Sign product and feature pages: https://www.zoho.com/sign/ and https://www.zoho.com/sign/features-and-benefits/
- MagicBricks official site: https://www.magicbricks.com/
- 99acres official site: https://www.99acres.com/
- Urban Company official site: https://www.urbancompany.com/
- Livspace official site: https://www.livspace.com/
- LinkedIn Recruiter features: https://business.linkedin.com/talent-solutions/recruiter/recruiter-features
- Naukri recruiter products: https://recruit.naukri.com/hiringsuite/naukri-resdex.html
- Printo corporate gifting: https://printo.in/categories/corporate-gifting
- Hidesign brand story: https://www.hidesignusa.com/pages/about-us
- SAP Ariba sourcing and supplier lifecycle: https://help.sap.com/docs/strategic-sourcing/sap-ariba-product-sourcing/sap-ariba-strategic-sourcing-suite

Notes:
- Business models in this document are partly inferred from the platforms’ product structure and public positioning.
- Use this as the implementation blueprint for the next coding phases inside this repository.
