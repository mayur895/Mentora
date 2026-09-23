$BASE = "http://localhost:5000/api"
$PASS = "Student@1234"
$EMAIL = "student_seed@mentora.com"

Write-Host "`n============================================"
Write-Host "   FULL BOOKING + PAYMENT FLOW TEST"
Write-Host "============================================`n"

# Step 1: Login as student
Write-Host "STEP 1: Login as student..." -ForegroundColor Cyan
$loginBody = @{ email = $EMAIL; password = $PASS } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST -Uri "$BASE/auth/login" -Body $loginBody -ContentType "application/json"
$TOKEN = $login.token
$HEADERS = @{ Authorization = "Bearer $TOKEN" }
Write-Host "  OK: $($login.user.name) | Role: $($login.user.role)" -ForegroundColor Green

# Step 2: Get mentor list
Write-Host "`nSTEP 2: Get mentor list..." -ForegroundColor Cyan
$mentors = Invoke-RestMethod -Uri "$BASE/mentors" -Headers $HEADERS
Write-Host "  OK: $($mentors.Count) mentor(s) found" -ForegroundColor Green
$m = $mentors[0]
Write-Host "  Mentor profile _id : $($m._id)" -ForegroundColor DarkGray
Write-Host "  Mentor name        : $($m.userId.name)" -ForegroundColor DarkGray
Write-Host "  Hourly rate        : `$$($m.hourlyRate)/hr" -ForegroundColor DarkGray
Write-Host "  userId null?       : $($null -eq $m.userId)" -ForegroundColor DarkGray

# Step 3: Create session using MentorProfile _id
Write-Host "`nSTEP 3: Create session (passing MentorProfile _id)..." -ForegroundColor Cyan
$sched = (Get-Date).AddDays(5).ToString("yyyy-MM-ddTHH:mm:ss")
$sessionBody = @{
    mentorId    = $m._id
    skill       = $m.skills[0]
    type        = "1on1"
    scheduledAt = $sched
    duration    = 60
    price       = $m.hourlyRate
} | ConvertTo-Json
try {
    $session = Invoke-RestMethod -Method POST -Uri "$BASE/sessions" -Body $sessionBody -ContentType "application/json" -Headers $HEADERS
    Write-Host "  OK: Session created!" -ForegroundColor Green
    Write-Host "  Session _id    : $($session._id)" -ForegroundColor DarkGray
    Write-Host "  mentorId stored: $($session.mentorId)" -ForegroundColor DarkGray
    Write-Host "  studentId      : $($session.studentId)" -ForegroundColor DarkGray
    Write-Host "  Status         : $($session.status)" -ForegroundColor DarkGray
    Write-Host "  Price          : `$$($session.price)" -ForegroundColor DarkGray
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Create Stripe Checkout
Write-Host "`nSTEP 4: Create Stripe checkout session..." -ForegroundColor Cyan
$payBody = @{ sessionId = $session._id } | ConvertTo-Json
try {
    $pay = Invoke-RestMethod -Method POST -Uri "$BASE/payments/create-checkout-session" -Body $payBody -ContentType "application/json" -Headers $HEADERS
    if ($pay.isTestMode) {
        Write-Host "  WARNING: Demo mode - no real Stripe key" -ForegroundColor Yellow
        Write-Host "  Demo URL: $($pay.url)" -ForegroundColor Yellow
    } else {
        Write-Host "  OK: REAL STRIPE CHECKOUT URL GENERATED!" -ForegroundColor Green
        Write-Host "  URL: $($pay.url.Substring(0, 80))..." -ForegroundColor Cyan
    }
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Confirm payment
Write-Host "`nSTEP 5: Confirm payment..." -ForegroundColor Cyan
$confirmBody = @{ sessionId = $session._id } | ConvertTo-Json
try {
    $confirm = Invoke-RestMethod -Method POST -Uri "$BASE/payments/confirm-payment" -Body $confirmBody -ContentType "application/json" -Headers $HEADERS
    Write-Host "  OK: $($confirm.message)" -ForegroundColor Green
    Write-Host "  Session status : $($confirm.session.status)" -ForegroundColor DarkGray
    Write-Host "  Payment status : $($confirm.payment.status)" -ForegroundColor DarkGray
    Write-Host "  Amount         : `$$($confirm.payment.amount)" -ForegroundColor DarkGray
    Write-Host "  Commission 15% : `$$($confirm.payment.commission)" -ForegroundColor DarkGray
    Write-Host "  Mentor payout  : `$$($confirm.payment.mentorPayout)" -ForegroundColor DarkGray
} catch {
    Write-Host "  FAILED: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "  ALL STEPS PASSED - PAYMENT FLOW WORKING!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Magenta
