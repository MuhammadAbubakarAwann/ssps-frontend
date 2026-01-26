generator client {
  provider = "prisma-client-js"
}

// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL")
// }

datasource db {
provider = "postgresql"
url      = env("DATABASE_URL")
directUrl      = env("DIRECT_URL")
}

enum UserRole {
  CUSTOMER
  RESTAURANT
  CLIENT
  ADMIN
  RIDER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

enum MealCategory {
  MAINS
  APPETIZERS
  DESSERTS
  DRINKS
  SIDES
  BREAKFAST
  LUNCH
  DINNER
  SNACKS
  OTHER
}

enum OrderStatus {
  PAYMENT_PENDING
  PENDING
  REJECTED
  PREPARING
  READY_FOR_PICKUP
  ASSIGNED_TO_RIDER
  PICKED_UP
  ON_THE_WAY
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}

enum PromotionType {
  PERCENTAGE_OFF
  FIXED_AMOUNT_OFF
  BUY_ONE_GET_ONE
  FREE_DELIVERY
  MINIMUM_ORDER_DISCOUNT
}

enum PromotionStatus {
  ACTIVE
  INACTIVE
  EXPIRED
  SCHEDULED
}

enum PromotionApplicability {
  ALL_ITEMS
  SPECIFIC_ITEMS
  CATEGORY_BASED
  MINIMUM_ORDER
}

enum RiderAssignmentRequestStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum RestaurantVerificationStatus {
  PROFILE_INCOMPLETE // Restaurant profile details not completed
  DOCUMENTS_PENDING // Profile complete but documents not submitted
  UNDER_REVIEW // Documents submitted, being reviewed by admin
  VERIFIED // Verification completed, restaurant can operate
  REJECTED // Verification rejected, needs resubmission
}

enum EarningStatus {
  PENDING
  COMPLETED
}

enum WithdrawalStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

model User {
  id               String     @id @default(cuid())
  email            String
  phone            String?    @unique
  password         String? // Make password optional to handle Google users
  firebaseUid      String?    @unique @map("firebase_uid")
  googleId         String?    @unique @map("google_id")
  firstName        String
  lastName         String
  role             UserRole
  status           UserStatus @default(PENDING)
  isVerified       Boolean    @default(false)
  avatar           String?
  stripeCustomerId String? // Added Stripe customer ID field

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastLoginAt DateTime?

  verificationCode          String?
  verificationCodeExpiresAt DateTime?
  emailVerifiedAt           DateTime?
  passwordResetToken        String?
  passwordResetExpiresAt    DateTime?

  refreshTokens         RefreshToken[]
  customerProfile       CustomerProfile?
  restaurantProfile     RestaurantProfile?
  clientProfile         ClientProfile?
  adminProfile          AdminProfile?
  riderProfile          RiderProfile?
  ordersAsCustomer      Order[]                  @relation("CustomerOrders")
  ordersAsRider         Order[]                  @relation("RiderOrders")
  cart                  Cart?
  riderLocationHistory  RiderLocation[]          @relation("RiderLocationHistory")
  assignmentRequests    RiderAssignmentRequest[] @relation("RiderAssignmentRequests")
  paymentMethods        PaymentMethod[] // Added relation to PaymentMethod model
  favoriteMeals         FavoriteMeal[]           @relation("FavoriteMeals")
  notificationSettings  NotificationSettings?    @relation("NotificationSettings")
  riderEarnings         RiderEarning[]           @relation("RiderEarnings")
  riderWithdrawals      RiderWithdrawal[]        @relation("RiderWithdrawals")
  deviceTokens          DeviceToken[]            @relation("UserDeviceTokens")
  stripeConnectAccount  StripeConnectAccount?    @relation("StripeConnectAccount")
  customerSubscriptions CustomerSubscription[]   @relation("CustomerSubscriptions")
  
  // Reels Relations
  reels         Reel[]        @relation("UserReels")
  reelLikes     ReelLike[]    @relation("UserReelLikes")  
  reelComments  ReelComment[] @relation("UserReelComments")
  reelShares    ReelShare[]   @relation("UserReelShares")
  reelViews     ReelView[]    @relation("UserReelViews")

  @@unique([email, role])
  @@index([stripeCustomerId]) // Added index for Stripe customer ID
  @@map("users")
}

model OTP {
  id        String   @id @default(cuid())
  email     String
  otp       String   @db.VarChar(4)
  type      String   @default("PASSWORD_SETUP")
  expiresAt DateTime @map("expires_at")
  isUsed    Boolean  @default(false) @map("is_used")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([email])
  @@index([otp])
  @@index([expiresAt])
  @@map("otps")
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@map("refresh_tokens")
}

model CustomerProfile {
  id          String    @id @default(cuid())
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  dateOfBirth DateTime?
  preferences Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  addresses CustomerAddress[]

  @@map("customer_profiles")
}

model RestaurantProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  businessName    String?
  description     String?
  cuisine         String[]
  address         String?
  city            String?
  postalCode      String?
  latitude        Float?
  longitude       Float?
  businessEmail   String?
  contactNumber   String?
  operatingHours  Json?
  profilePhotoUrl String?
  coverPhotoUrl   String?

  // Verification system
  verificationStatus          RestaurantVerificationStatus @default(PROFILE_INCOMPLETE)
  verificationRejectionReason String?
  verifiedAt                  DateTime?
  verifiedBy                  String? // Admin user ID who verified

  // Tax registration number as string field
  taxRegistrationNumber String?

  // Document URLs
  foodServiceLicenseUrl                String?
  governmentRegistrationCertificateUrl String?
  healthInspectionReportUrl            String?

  // Legacy field - kept for backward compatibility but will be replaced by verificationStatus
  isDocumentsVerified Boolean  @default(false)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  meals             Meal[]
  promotions        Promotion[]
  orders            Order[]
  earnings          RestaurantEarning[] @relation("RestaurantEarnings")
  subscriptionPlans SubscriptionPlan[]  @relation("RestaurantSubscriptionPlans")
  activatedPlans    RestaurantActivatedPlan[] @relation("RestaurantActivatedPlans")
  
  // Reels Relations
  reelTags          ReelRestaurantTag[] @relation("RestaurantReelTags")

  @@map("restaurant_profiles")
}

model RiderProfile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Basic vehicle info
  vehicleType  String? // Bike, Car, Bicycle, etc.
  vehicleBrand String? // Honda, Toyota, etc.
  licensePlate String? // ABC-123

  // Vehicle insurance document
  vehicleInsurancePhotoUrl String?

  // Verification documents
  driversLicenseUrl  String? // Valid Driver's License
  registrationUrl    String? // Registration
  workEligibilityUrl String? // Proof of Eligibility to Work in Canada

  // Document verification status
  isDocumentsVerified Boolean @default(false)

  // Rider availability status
  isAvailable        Boolean   @default(true)
  currentLatitude    Float?
  currentLongitude   Float?
  lastLocationUpdate DateTime?

  // Manual override for working outside hours
  manualOverrideUntil DateTime?

  // Work schedule preferences
  workScheduleType String? // "full_time" or "part_time"
  morningDays      String[] // Days available for morning shifts
  afternoonDays    String[] // Days available for afternoon shifts
  nightDays        String[] // Days available for night shifts

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bankDetails            RiderBankDetails?
  subscriptionDeliveries SubscriptionDelivery[] @relation("RiderDeliveries")

  @@map("rider_profiles")
}

model RiderBankDetails {
  id      String       @id @default(cuid())
  riderId String       @unique
  rider   RiderProfile @relation(fields: [riderId], references: [id], onDelete: Cascade)

  // Bank information
  bankName      String // Selected from dropdown
  accountNumber String // Account number
  accountName   String // Account holder name

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("rider_bank_details")
}

model ClientProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  companyName  String
  businessType String
  address      String
  city         String
  postalCode   String
  website      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("client_profiles")
}

model AdminProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  permissions Json?
  department  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("admin_profiles")
}

model Meal {
  id           String            @id @default(cuid())
  restaurantId String
  restaurant   RestaurantProfile @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  name         String
  description  String?
  category     MealCategory
  price        Float
  isPromoted   Boolean           @default(false)
  inStock      Boolean           @default(true)
  availableForSubscription Boolean @default(true) // Control if meal can be selected in subscription plans
  properties   String[]          @default([]) // Meal properties for preference matching (e.g., ["vegetarian", "high-protein", "gluten-free"])
  imageUrls    String[]
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  mealPromotions         MealPromotion[]
  redemptions            PromotionRedemption[]
  orderItems             OrderItem[]
  cartItems              CartItem[]
  favoritedBy            FavoriteMeal[]         @relation("FavoritedBy")
  subscriptionPlanMeals  SubscriptionPlanMeal[] @relation("MealSubscriptionPlans")
  subscriptionDeliveries SubscriptionDelivery[] @relation("MealDeliveries")
  reelTags               ReelMealTag[]          @relation("MealReelTags")
  customMealDeliveries   MealDelivery[]         @relation("CustomMealDeliveries")

  @@map("meals")
}

model Promotion {
  id                    String                 @id @default(cuid())
  restaurantId          String
  restaurant            RestaurantProfile      @relation(fields: [restaurantId], references: [id], onDelete: Cascade)
  name                  String
  description           String?
  type                  PromotionType
  applicability         PromotionApplicability
  status                PromotionStatus        @default(ACTIVE)
  discountValue         Float
  minimumOrderAmount    Float?
  maximumDiscountAmount Float?
  usageLimit            Int?
  usageLimitPerCustomer Int?
  currentUsageCount     Int                    @default(0)
  startDate             DateTime
  endDate               DateTime
  applicableCategories  String[]
  totalRevenue          Float                  @default(0)
  totalSavings          Float                  @default(0)
  createdAt             DateTime               @default(now())
  updatedAt             DateTime               @updatedAt

  mealPromotions MealPromotion[]
  redemptions    PromotionRedemption[]

  @@map("promotions")
}

model MealPromotion {
  id          String    @id @default(cuid())
  mealId      String
  promotionId String
  meal        Meal      @relation(fields: [mealId], references: [id], onDelete: Cascade)
  promotion   Promotion @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())

  @@unique([mealId, promotionId])
  @@map("meal_promotions")
}

model PromotionRedemption {
  id             String    @id @default(cuid())
  promotionId    String
  promotion      Promotion @relation(fields: [promotionId], references: [id], onDelete: Cascade)
  customerId     String?
  orderId        String?
  mealId         String?
  meal           Meal?     @relation(fields: [mealId], references: [id], onDelete: SetNull)
  order          Order?    @relation(fields: [orderId], references: [id])
  originalAmount Float
  discountAmount Float
  finalAmount    Float
  quantity       Int       @default(1)
  redemptionDate DateTime  @default(now())

  @@map("promotion_redemptions")
}

model Order {
  id                       String            @id @default(cuid())
  customerId               String
  customer                 User              @relation("CustomerOrders", fields: [customerId], references: [id])
  restaurantId             String
  restaurant               RestaurantProfile @relation(fields: [restaurantId], references: [id])
  riderId                  String?
  rider                    User?             @relation("RiderOrders", fields: [riderId], references: [id])
  totalAmount              Float
  subtotalAmount           Float? // Order amount before tip (for earnings calculation)
  tipAmount                Float?            @default(0) // Customer tip amount
  tipPercentage            Float? // Tip percentage if tip was percentage-based
  tipType                  String? // Type: "none", "10", "15", "25", "other"
  riderEarning             Float? // 10% of subtotal + 100% of tip (calculated when order is delivered)
  restaurantEarning        Float? // 90% of subtotal (calculated when order is delivered)
  earningsCalculatedAt     DateTime? // When earnings were calculated
  deliveryAddress          String
  deliveryLatitude         Float?
  deliveryLongitude        Float?
  customerAddressId        String?
  customerAddress          CustomerAddress?  @relation("DeliveryAddress", fields: [customerAddressId], references: [id])
  status                   OrderStatus       @default(PENDING)
  orderDate                DateTime          @default(now())
  specialInstructions      String?
  paymentStatus            PaymentStatus     @default(PENDING)
  paymentMethod            String?
  paymentIntentId          String?
  paidAt                   DateTime?
  deliveryVerificationCode String?           @unique
  isDeliveryVerified       Boolean           @default(false)
  deliveryVerifiedAt       DateTime?
  
  // Subscription Order Fields
  isSubscriptionOrder      Boolean           @default(false) // Tag to identify subscription orders
  mealDeliveryId           String?           @unique // Link to MealDelivery if from subscription
  mealDelivery             MealDelivery?     @relation("SubscriptionOrderDelivery", fields: [mealDeliveryId], references: [id])
  
  createdAt                DateTime          @default(now())
  updatedAt                DateTime          @updatedAt

  orderItems              OrderItem[]
  redemptions             PromotionRedemption[]
  locationTracking        RiderLocation[]          @relation("OrderLocationTracking")
  orderTracking           OrderTracking?           @relation("OrderTrackingInfo")
  assignmentRequests      RiderAssignmentRequest[] @relation("RiderAssignmentRequests")
  riderEarningRecord      RiderEarning?            @relation("RiderOrderEarning")
  restaurantEarningRecord RestaurantEarning?       @relation("RestaurantOrderEarning")
  paymentSplit            PaymentSplit?            @relation("OrderPaymentSplit")

  @@map("orders")
}

model OrderItem {
  id                 String   @id @default(cuid())
  orderId            String
  order              Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  mealId             String
  meal               Meal     @relation(fields: [mealId], references: [id])
  quantity           Int
  priceAtTimeOfOrder Float
  notes              String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@map("order_items")
}

model Cart {
  id         String   @id @default(cuid())
  customerId String   @unique
  customer   User     @relation(fields: [customerId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  items CartItem[]

  @@map("carts")
}

model CartItem {
  id            String   @id @default(cuid())
  cartId        String
  cart          Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  mealId        String
  meal          Meal     @relation(fields: [mealId], references: [id])
  restaurantId  String
  quantity      Int
  notes         String?
  priceSnapshot Float
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("cart_items")
}

model RiderLocation {
  id        String   @id @default(cuid())
  riderId   String
  orderId   String?
  latitude  Float
  longitude Float
  heading   Float?
  speed     Float?
  accuracy  Float?
  timestamp DateTime @default(now())

  rider User   @relation("RiderLocationHistory", fields: [riderId], references: [id])
  order Order? @relation("OrderLocationTracking", fields: [orderId], references: [id])

  @@map("rider_locations")
}

model OrderTracking {
  id                    String    @id @default(cuid())
  orderId               String    @unique
  estimatedDeliveryTime DateTime?
  actualPickupTime      DateTime?
  actualDeliveryTime    DateTime?
  totalDistance         Float?
  totalDuration         Int?
  currentStatus         String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  order Order @relation("OrderTrackingInfo", fields: [orderId], references: [id])

  @@map("order_tracking")
}

model RiderAssignmentRequest {
  id                   String                       @id @default(cuid())
  orderId              String
  riderId              String
  status               RiderAssignmentRequestStatus @default(PENDING)
  distanceKm           Float?
  estimatedTimeMinutes Int?
  riderScore           Float?
  requestedAt          DateTime                     @default(now())
  responseAt           DateTime?
  expiresAt            DateTime
  createdAt            DateTime                     @default(now())
  updatedAt            DateTime                     @updatedAt

  order Order @relation("RiderAssignmentRequests", fields: [orderId], references: [id])
  rider User  @relation("RiderAssignmentRequests", fields: [riderId], references: [id])

  @@map("rider_assignment_requests")
}

model CustomerAddress {
  id               String          @id @default(cuid())
  customerId       String
  customer         CustomerProfile @relation(fields: [customerId], references: [id], onDelete: Cascade)
  formattedAddress String
  latitude         Float
  longitude        Float
  components       Json? // Store address components like city, state, postal code, etc.
  isDefault        Boolean         @default(false)
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  ordersAsDeliveryAddress Order[] @relation("DeliveryAddress")

  @@map("customer_addresses")
}

model PaymentMethod {
  id                    String   @id @default(cuid())
  userId                String
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  stripePaymentMethodId String   @unique
  type                  String // card, bank_account, etc.
  brand                 String? // visa, mastercard, etc.
  last4                 String? // last 4 digits
  expiryMonth           Int?
  expiryYear            Int?
  isDefault             Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@map("payment_methods")
}

model FavoriteMeal {
  id         String   @id @default(cuid())
  customerId String
  customer   User     @relation("FavoriteMeals", fields: [customerId], references: [id], onDelete: Cascade)
  mealId     String
  meal       Meal     @relation("FavoritedBy", fields: [mealId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())

  @@unique([customerId, mealId])
  @@map("favorite_meals")
}

model NotificationSettings {
  id                String   @id @default(cuid())
  customerId        String   @unique
  customer          User     @relation("NotificationSettings", fields: [customerId], references: [id], onDelete: Cascade)
  orderUpdates      Boolean  @default(true) // Order status updates
  promotionsDeals   Boolean  @default(true) // Promotions and special offers
  mealSuggestions   Boolean  @default(true) // Personalized meal recommendations
  giftNotifications Boolean  @default(true) // Gift-related notifications
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("notification_settings")
}

// Earnings tracking models
model RiderEarning {
  id         String        @id @default(cuid())
  riderId    String
  rider      User          @relation("RiderEarnings", fields: [riderId], references: [id])
  orderId    String        @unique
  order      Order         @relation("RiderOrderEarning", fields: [orderId], references: [id])
  amount     Float // Total earning amount (base + tips)
  baseAmount Float // 10% of order subtotal
  tipAmount  Float         @default(0) // 100% of tips
  status     EarningStatus @default(PENDING)
  earnedAt   DateTime? // When earning was completed (order delivered)
  createdAt  DateTime      @default(now()) // When earning record was created (order assigned)
  updatedAt  DateTime      @updatedAt

  @@map("rider_earnings")
}

model RiderWithdrawal {
  id             String           @id @default(cuid())
  riderId        String
  rider          User             @relation("RiderWithdrawals", fields: [riderId], references: [id])
  amount         Float
  status         WithdrawalStatus @default(PENDING)
  paymentMethod  String // e.g., "bank_transfer", "paypal", "stripe", etc.
  paymentDetails Json? // Store payment method specific details
  requestedAt    DateTime         @default(now())
  processedAt    DateTime?
  completedAt    DateTime?
  failedReason   String?
  transactionId  String? // External payment processor transaction ID
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@map("rider_withdrawals")
}

model RestaurantEarning {
  id           String            @id @default(cuid())
  restaurantId String
  restaurant   RestaurantProfile @relation("RestaurantEarnings", fields: [restaurantId], references: [id])
  orderId      String            @unique
  order        Order             @relation("RestaurantOrderEarning", fields: [orderId], references: [id])
  amount       Float // 90% of order total
  earnedAt     DateTime          @default(now())
  createdAt    DateTime          @default(now())

  @@map("restaurant_earnings")
}

// Stripe Connect models for payment splitting
model StripeConnectAccount {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation("StripeConnectAccount", fields: [userId], references: [id], onDelete: Cascade)
  stripeAccountId     String             @unique // Stripe Connect account ID
  accountType         ConnectAccountType // EXPRESS or STANDARD
  chargesEnabled      Boolean            @default(false) // Can receive payments
  payoutsEnabled      Boolean            @default(false) // Can receive payouts
  detailsSubmitted    Boolean            @default(false) // Required info submitted
  currentlyDue        String[] // Fields currently due for verification
  eventuallyDue       String[] // Fields eventually due
  pastDue             String[] // Fields past due
  pendingVerification String[] // Fields pending verification
  onboardingUrl       String? // URL for completing onboarding
  dashboardUrl        String? // URL for Stripe Express dashboard
  isActive            Boolean            @default(true) // For soft delete functionality
  deactivatedAt       DateTime? // When account was deactivated
  reactivatedAt       DateTime? // When account was reactivated
  deactivationReason  String? // Reason for deactivation
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt

  payouts PayoutRecord[]

  @@map("stripe_connect_accounts")
}

model PayoutRecord {
  id               String               @id @default(cuid())
  connectAccountId String
  connectAccount   StripeConnectAccount @relation(fields: [connectAccountId], references: [id])
  stripePayoutId   String               @unique // Stripe payout ID
  amount           Float // Payout amount in dollars
  currency         String               @default("cad") // Currency code
  status           PayoutStatus         @default(PENDING) // Payout status
  arrivalDate      DateTime? // Expected arrival date
  description      String? // Payout description
  failureCode      String? // Failure code if failed
  failureMessage   String? // Failure message if failed
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  @@map("payout_records")
}

model PaymentSplit {
  id                      String             @id @default(cuid())
  orderId                 String             @unique
  order                   Order              @relation("OrderPaymentSplit", fields: [orderId], references: [id])
  stripePaymentIntentId   String             @unique // Original payment intent ID
  totalAmount             Float // Total payment amount
  platformFeeAmount       Float // Platform's commission
  restaurantAmount        Float // Amount transferred to restaurant
  riderAmount             Float // Amount transferred to rider
  restaurantTransferId    String? // Stripe transfer ID to restaurant
  riderTransferId         String? // Stripe transfer ID to rider
  status                  PaymentSplitStatus @default(PENDING)
  processedAt             DateTime?
  confirmedAt             DateTime? // When payment was confirmed
  restaurantTransferredAt DateTime? // When restaurant payment was processed
  riderTransferredAt      DateTime? // When rider payment was processed
  failureReason           String?
  createdAt               DateTime           @default(now())
  updatedAt               DateTime           @updatedAt

  @@map("payment_splits")
}

enum ConnectAccountType {
  EXPRESS
  STANDARD
}

enum PayoutStatus {
  PENDING
  IN_TRANSIT
  PAID
  FAILED
  CANCELED
}

enum PaymentSplitStatus {
  PENDING
  CONFIRMED_PENDING_TRANSFER
  PROCESSING
  COMPLETED
  FAILED
  PARTIALLY_COMPLETED
}

enum DevicePlatform {
  IOS
  ANDROID
  WEB
}

model DeviceToken {
  id         String         @id @default(cuid())
  userId     String
  user       User           @relation("UserDeviceTokens", fields: [userId], references: [id], onDelete: Cascade)
  token      String // FCM device token
  platform   DevicePlatform // Device platform
  deviceId   String? // Unique device identifier
  appVersion String? // App version
  isActive   Boolean        @default(true) // Token is active and valid
  lastUsedAt DateTime       @default(now()) // Last time the token was used to send notification
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  @@unique([userId, token]) // Prevent duplicate tokens for same user
  @@index([userId])
  @@index([token])
  @@index([isActive])
  @@map("device_tokens")
}

// Meal Subscription System Models

enum SubscriptionStatus {
  PENDING
  ACTIVE
  PAUSED
  CANCELLED
  COMPLETED
  EXPIRED
}

enum DeliveryStatus {
  SCHEDULED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  PAUSED
  FAILED
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}

enum PlanType {
  BASIC       // 3 meals/week
  STANDARD    // 7 meals/week
  PREMIUM     // 14+ meals/week
  CUSTOM      // For restaurant custom plans
}

enum PaymentFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
}

model SubscriptionPlan {
  id           String            @id @default(cuid())
  restaurantId String?
  restaurant   RestaurantProfile? @relation("RestaurantSubscriptionPlans", fields: [restaurantId], references: [id], onDelete: Cascade)

  // System Plan Flag
  isSystemPlan Boolean @default(false) // True for predefined system plans

  // Plan Details
  name          String
  description   String?
  planType      PlanType @default(CUSTOM) // BASIC (3 meals), STANDARD (7 meals), PREMIUM (14+ meals), or CUSTOM
  durationWeeks Int     @default(1) // How many weeks the plan lasts
  price         Float // Total price for the entire plan
  mealsPerWeek  Int     @default(1) // Number of meals per week (flexible based on restaurant choice)
  paymentFrequency PaymentFrequency @default(WEEKLY) // How often customer pays
  weeklyPrice   Float? // Price per week (for recurring calculations)
  biweeklyPrice Float? // Price per biweek (for recurring calculations)
  monthlyPrice  Float? // Price per month (for recurring calculations)

  // Scheduling
  startDayOfWeek Int   @default(1) // 1 = Monday, 7 = Sunday
  deliveryDays   Int[] // Array of delivery days (1-7)

  // Status
  isActive Boolean @default(true)

  // Relationships
  planMeals     SubscriptionPlanMeal[] @relation("PlanMeals")
  customerPlans CustomerSubscription[] @relation("CustomerPlanSubscriptions")
  customSchedules CustomerSchedule[]   @relation("CustomSchedules")
  activatedByRestaurants RestaurantActivatedPlan[] @relation("ActivatedByRestaurants")

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([restaurantId])
  @@index([isActive])
  @@index([isSystemPlan])
  @@map("subscription_plans")
}

model SubscriptionPlanMeal {
  id     String           @id @default(cuid())
  planId String
  plan   SubscriptionPlan @relation("PlanMeals", fields: [planId], references: [id], onDelete: Cascade)
  mealId String
  meal   Meal             @relation("MealSubscriptionPlans", fields: [mealId], references: [id], onDelete: Cascade)

  // Meal Schedule
  dayOfWeek Int // 1-7 (Monday to Sunday)
  mealType  MealType // breakfast, lunch, dinner, snack
  quantity  Int      @default(1)

  // Meal Properties and Customizations
  properties   String[] // e.g., ["low-carb", "high-protein", "gluten-free", "vegetarian"]
  instructions String? // Special preparation instructions

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([planId, dayOfWeek, mealType]) // Prevent duplicate meals for same day/time
  @@index([planId])
  @@index([mealId])
  @@map("subscription_plan_meals")
}

model RestaurantActivatedPlan {
  id           String            @id @default(cuid())
  restaurantId String
  restaurant   RestaurantProfile @relation("RestaurantActivatedPlans", fields: [restaurantId], references: [id], onDelete: Cascade)
  planId       String
  plan         SubscriptionPlan  @relation("ActivatedByRestaurants", fields: [planId], references: [id], onDelete: Cascade)

  // Activation Status
  isActive     Boolean @default(true)
  activatedAt  DateTime @default(now())
  deactivatedAt DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([restaurantId, planId])
  @@index([restaurantId])
  @@index([planId])
  @@map("restaurant_activated_plans")
}

model CustomerSubscription {
  id         String           @id @default(cuid())
  customerId String
  customer   User             @relation("CustomerSubscriptions", fields: [customerId], references: [id], onDelete: Cascade)
  planId     String
  plan       SubscriptionPlan @relation("CustomerPlanSubscriptions", fields: [planId], references: [id], onDelete: Restrict)

  // Subscription Period
  startDate DateTime
  endDate   DateTime
  totalCost Float

  // Delivery Information
  deliveryAddress     Json // Store full address details
  specialInstructions String?

  // Status Management
  status             SubscriptionStatus @default(PENDING)
  pausedUntil        DateTime?
  cancelledAt        DateTime?
  cancellationReason String?

  // Payment Information
  paymentIntentId String? // Stripe payment intent
  paidAmount      Float?  @default(0)

  // Relationships
  deliveries SubscriptionDelivery[] @relation("SubscriptionDeliveries")

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([customerId])
  @@index([planId])
  @@index([status])
  @@index([startDate])
  @@map("customer_subscriptions")
}

model SubscriptionDelivery {
  id             String               @id @default(cuid())
  subscriptionId String
  subscription   CustomerSubscription @relation("SubscriptionDeliveries", fields: [subscriptionId], references: [id], onDelete: Cascade)
  mealId         String
  meal           Meal                 @relation("MealDeliveries", fields: [mealId], references: [id], onDelete: Restrict)

  // Delivery Schedule
  scheduledDate DateTime
  mealType      MealType
  quantity      Int      @default(1)

  // Customizations
  properties          String[] // Applied meal properties
  specialInstructions String?

  // Delivery Status
  status               DeliveryStatus @default(SCHEDULED)
  preparationStartedAt DateTime?
  deliveredAt          DateTime?

  // Delivery Information
  riderId               String? // If assigned to a rider
  rider                 RiderProfile? @relation("RiderDeliveries", fields: [riderId], references: [id], onDelete: SetNull)
  estimatedDeliveryTime DateTime?
  actualDeliveryTime    DateTime?
  deliveryNotes         String?

  // Quality Control
  rating   Int? // 1-5 stars from customer
  feedback String?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([subscriptionId])
  @@index([mealId])
  @@index([riderId])
  @@index([scheduledDate])
  @@index([status])
  @@map("subscription_deliveries")
}

// Reels System Models
enum ReelType {
  CUSTOMER
  RESTAURANT  
  RIDER
}

enum ReelStatus {
  UPLOADING
  PROCESSING
  PUBLISHED
  FAILED
  DELETED
}

model Reel {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation("UserReels", fields: [userId], references: [id], onDelete: Cascade)
  type        ReelType
  
  // Content Details
  videoUrl    String?    // S3 or cloud storage URL (set after upload)
  thumbnailUrl String?   // Video thumbnail
  description String?
  duration    Int?       // Video duration in seconds
  
  // Metadata
  fileSize    BigInt?    // File size in bytes
  resolution  String?    // e.g., "1080x1920"
  format      String?    // e.g., "mp4", "mov"
  
  // Tagged Restaurants (multiple) and Meals (for restaurant reels)
  taggedRestaurants ReelRestaurantTag[] @relation("ReelTaggedRestaurants")
  taggedMeals       ReelMealTag[]       @relation("ReelTaggedMeals")
  
  // Location Information
  locationName      String? // Human readable location name
  latitude          Float?
  longitude         Float?
  address           String?
  city              String?
  state             String?
  country           String?
  
  // Engagement
  viewCount    Int @default(0)
  likeCount    Int @default(0)
  commentCount Int @default(0)
  shareCount   Int @default(0)
  
  // Status and Visibility
  status       ReelStatus @default(UPLOADING)
  isPublic     Boolean    @default(true)
  
  // Relationships
  likes        ReelLike[]    @relation("ReelLikes")
  comments     ReelComment[] @relation("ReelComments")
  shares       ReelShare[]   @relation("ReelShares")
  views        ReelView[]    @relation("ReelViews")
  
  // Timestamps
  uploadedAt   DateTime?
  publishedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([publishedAt])
  @@index([createdAt])
  @@map("reels")
}

model ReelLike {
  id     String @id @default(cuid())
  userId String
  user   User   @relation("UserReelLikes", fields: [userId], references: [id], onDelete: Cascade)
  reelId String
  reel   Reel   @relation("ReelLikes", fields: [reelId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([userId, reelId])
  @@index([reelId])
  @@index([userId])
  @@map("reel_likes")
}

model ReelComment {
  id      String @id @default(cuid())
  userId  String
  user    User   @relation("UserReelComments", fields: [userId], references: [id], onDelete: Cascade)
  reelId  String
  reel    Reel   @relation("ReelComments", fields: [reelId], references: [id], onDelete: Cascade)
  
  content String
  
  // Reply system
  parentId String?
  parent   ReelComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies  ReelComment[] @relation("CommentReplies")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([reelId])
  @@index([userId])
  @@index([parentId])
  @@map("reel_comments")
}

model ReelShare {
  id     String @id @default(cuid())
  userId String
  user   User   @relation("UserReelShares", fields: [userId], references: [id], onDelete: Cascade)
  reelId String
  reel   Reel   @relation("ReelShares", fields: [reelId], references: [id], onDelete: Cascade)
  
  platform String? // "whatsapp", "instagram", "facebook", etc.
  
  createdAt DateTime @default(now())
  
  @@index([reelId])
  @@index([userId])
  @@map("reel_shares")
}

model ReelView {
  id     String @id @default(cuid())
  userId String?
  user   User?  @relation("UserReelViews", fields: [userId], references: [id], onDelete: SetNull)
  reelId String
  reel   Reel   @relation("ReelViews", fields: [reelId], references: [id], onDelete: Cascade)
  
  // View tracking
  ipAddress    String?
  userAgent    String?
  watchTime    Int?    // Seconds watched
  isCompleted  Boolean @default(false)
  
  createdAt DateTime @default(now())
  
  @@index([reelId])
  @@index([userId])
  @@index([createdAt])
  @@map("reel_views")
}

model ReelRestaurantTag {
  id           String @id @default(cuid())
  reelId       String
  reel         Reel   @relation("ReelTaggedRestaurants", fields: [reelId], references: [id], onDelete: Cascade)
  restaurantId String
  restaurant   RestaurantProfile @relation("RestaurantReelTags", fields: [restaurantId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([reelId, restaurantId])
  @@index([reelId])
  @@index([restaurantId])
  @@map("reel_restaurant_tags")
}

model ReelMealTag {
  id     String @id @default(cuid())
  reelId String
  reel   Reel   @relation("ReelTaggedMeals", fields: [reelId], references: [id], onDelete: Cascade)
  mealId String
  meal   Meal   @relation("MealReelTags", fields: [mealId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  
  @@unique([reelId, mealId])
  @@index([reelId])
  @@index([mealId])
  @@map("reel_meal_tags")
}

// Customer meal preferences for subscription
model CustomerMealPreferences {
  id         String   @id @default(cuid())
  customerId String   @unique
  
  // Meal Preferences (stored as array of strings)
  preferences String[] @default([]) // e.g., ["vegetarian", "high-protein", "gluten-free", "low-carb"]
  
  // Dietary Restrictions
  allergies String[] @default([]) // e.g., ["peanuts", "dairy", "shellfish"]
  dislikes  String[] @default([]) // e.g., ["mushrooms", "olives"]
  
  // Additional Notes
  notes String?
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([customerId])
  @@map("customer_meal_preferences")
}

// Simplified meal delivery schedule models
model CustomerSchedule {
  id             String   @id @default(cuid())
  customerId     String
  planId         String
  restaurantId   String?  // Make optional for backward compatibility
  plan           SubscriptionPlan @relation("CustomSchedules", fields: [planId], references: [id], onDelete: Cascade)

  // Schedule Details
  startDate           DateTime
  deliveryAddress     String   // JSON string
  specialInstructions String?

  // Payment & Renewal Tracking
  paymentFrequency PaymentFrequency @default(WEEKLY) // Selected payment frequency
  weeksPaidFor     Int              @default(1)      // Number of weeks paid (1, 2, or 4)
  currentWeek      Int              @default(1)      // Current week number in the cycle
  weekEndDate      DateTime?                         // When current week ends
  autoRenew        Boolean          @default(true)   // Whether to auto-renew for next week

  // Status Management
  status             String @default("SCHEDULED") // SCHEDULED, ACTIVE, COMPLETED, CANCELLED
  cancelledAt        DateTime?
  cancellationReason String?

  // Relationships
  deliveries MealDelivery[] @relation("ScheduleDeliveries")

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([customerId])
  @@index([planId])
  @@index([restaurantId])
  @@index([status])
  @@index([weekEndDate])
  @@map("customer_schedules")
}

model MealDelivery {
  id          String           @id @default(cuid())
  scheduleId  String
  schedule    CustomerSchedule @relation("ScheduleDeliveries", fields: [scheduleId], references: [id], onDelete: Cascade)
  mealId      String
  meal        Meal            @relation("CustomMealDeliveries", fields: [mealId], references: [id], onDelete: Restrict)

  // Delivery Schedule
  deliveryDay  Int      // Day number (1-7)
  deliveryDate DateTime
  deliveryTime String   // e.g., "12:00"
  timeSlot     String   // e.g., "12:00-14:00"

  // Delivery Status
  status      String    @default("SCHEDULED") // SCHEDULED, PREPARING, DELIVERED, CANCELLED
  deliveredAt DateTime?
  
  // Order Reference
  order       Order?    @relation("SubscriptionOrderDelivery") // Link to generated order

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([scheduleId])
  @@index([mealId])
  @@index([deliveryDate])
  @@index([status])
  @@map("meal_deliveries")
}
