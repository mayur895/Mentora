$BASE = "http://localhost:5000/api"
$testId = Get-Random -Minimum 1000 -Maximum 9999

$studentEmail = "student_test_$testId@mentora.com"
$mentorEmail = "mentor_test_$testId@mentora.com"
$password = "TestPass123!"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "         MENTORA MASTER END-TO-END APPLICATION TEST        " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$passed = 0
$failed = 0

function Test-Assert {
    param([string]$name, [bool]$condition, [string]$detail = "")
    if ($condition) {
        $script:passed++
        Write-Host "  [PASS] $name" -ForegroundColor Green
        if ($detail) { Write-Host "         -> $detail" -ForegroundColor Gray }
    } else {
        $script:failed++
        Write-Host "  [FAIL] $name" -ForegroundColor Red
        if ($detail) { Write-Host "         -> $detail" -ForegroundColor Yellow }
    }
}

# 1. API Health Check
Write-Host "`n1. TESTING BACKEND HEALTH & INFRASTRUCTURE" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE/health" -Method Get
    Test-Assert "Backend API Health Endpoint" ($health.status -eq "OK") "Status: $($health.status)"
} catch {
    Test-Assert "Backend API Health Endpoint" $false $_.Exception.Message
}

# 2. Authentication Flow
Write-Host "`n2. TESTING AUTHENTICATION & ACCOUNTS" -ForegroundColor Yellow
try {
    # Register Student
    $regStudentBody = @{ name = "Test Student $testId"; email = $studentEmail; password = $password; role = "student" } | ConvertTo-Json
    $studentRegRes = Invoke-RestMethod -Uri "$BASE/auth/register" -Method Post -Body $regStudentBody -ContentType "application/json"
    Test-Assert "Student Registration" ($null -ne $studentRegRes.token -and $studentRegRes.user.role -eq "student") "Token received for student"

    # Register Mentor
    $regMentorBody = @{ name = "Test Mentor $testId"; email = $mentorEmail; password = $password; role = "mentor" } | ConvertTo-Json
    $mentorRegRes = Invoke-RestMethod -Uri "$BASE/auth/register" -Method Post -Body $regMentorBody -ContentType "application/json"
    Test-Assert "Mentor Registration" ($null -ne $mentorRegRes.token -and $mentorRegRes.user.role -eq "mentor") "Token received for mentor"

    # Login Student
    $loginBody = @{ email = $studentEmail; password = $password } | ConvertTo-Json
    $studentLogin = Invoke-RestMethod -Uri "$BASE/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $studentToken = $studentLogin.token
    $studentUserId = $studentLogin.user._id
    Test-Assert "Student Login" ($null -ne $studentToken) "Logged in as $($studentLogin.user.name)"

    # Login Mentor
    $loginMentorBody = @{ email = $mentorEmail; password = $password } | ConvertTo-Json
    $mentorLogin = Invoke-RestMethod -Uri "$BASE/auth/login" -Method Post -Body $loginMentorBody -ContentType "application/json"
    $mentorToken = $mentorLogin.token
    $mentorUserId = $mentorLogin.user._id
    Test-Assert "Mentor Login" ($null -ne $mentorToken) "Logged in as $($mentorLogin.user.name)"
} catch {
    Test-Assert "Authentication Flow" $false $_.Exception.Message
}

# 3. Mentor Profile Setup & Dashboard
Write-Host "`n3. TESTING MENTOR PROFILE MANAGEMENT" -ForegroundColor Yellow
$mentorProfileId = $null
try {
    $mentorHeaders = @{ Authorization = "Bearer $mentorToken" }
    
    $profileUpdateBody = @{
        bio = "Expert Fullstack Engineer with 10+ years experience in Node.js and React."
        skills = @("React", "Node.js", "System Design", "TypeScript")
        hourlyRate = 60
        currency = "USD"
        verificationStatus = "verified"
    } | ConvertTo-Json

    # Use PUT /api/mentors/my-profile
    $profileRes = Invoke-RestMethod -Uri "$BASE/mentors/my-profile" -Method Put -Body $profileUpdateBody -Headers $mentorHeaders -ContentType "application/json"
    $mentorProfileId = $profileRes._id
    Test-Assert "Mentor Profile Setup (PUT /api/mentors/my-profile)" ($profileRes.hourlyRate -eq 60 -and $profileRes.skills.Count -eq 4) "Profile created/updated ID: $mentorProfileId"
} catch {
    Test-Assert "Mentor Profile Setup" $false $_.Exception.Message
}

# 4. Mentor Marketplace & Search
Write-Host "`n4. TESTING MENTOR MARKETPLACE & SEARCH" -ForegroundColor Yellow
try {
    $mentors = Invoke-RestMethod -Uri "$BASE/mentors?skill=React" -Method Get
    Test-Assert "Filter Mentors by Skill ('React')" ($mentors.Count -gt 0) "Found $($mentors.Count) React mentors"

    $fetchedMentor = Invoke-RestMethod -Uri "$BASE/mentors/$mentorProfileId" -Method Get
    Test-Assert "Get Mentor Details by Profile ID" ($fetchedMentor._id -eq $mentorProfileId) "Mentor bio loaded successfully"
} catch {
    Test-Assert "Mentor Marketplace Search" $false $_.Exception.Message
}

# 5. Session Booking & Payment Flow
Write-Host "`n5. TESTING SESSION BOOKING & STRIPE PAYMENT" -ForegroundColor Yellow
$sessionId = $null
try {
    $studentHeaders = @{ Authorization = "Bearer $studentToken" }

    $bookingBody = @{
        mentorId = $mentorProfileId
        skill = "React"
        type = "1on1"
        scheduledAt = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        duration = 60
        price = 60
    } | ConvertTo-Json

    $session = Invoke-RestMethod -Uri "$BASE/sessions" -Method Post -Body $bookingBody -Headers $studentHeaders -ContentType "application/json"
    $sessionId = $session._id
    Test-Assert "Create Session Request (POST /api/sessions)" ($session.status -eq "pending") "Session created: $sessionId"

    # Stripe Checkout Session
    $checkoutBody = @{ sessionId = $sessionId } | ConvertTo-Json
    $checkout = Invoke-RestMethod -Uri "$BASE/payments/create-checkout-session" -Method Post -Body $checkoutBody -Headers $studentHeaders -ContentType "application/json"
    Test-Assert "Stripe Checkout URL Generation" ($null -ne $checkout.url -and $checkout.url.Contains("stripe")) "Stripe Checkout URL generated"

    # Confirm Payment
    $confirmBody = @{ sessionId = $sessionId; paymentIntentId = "test_pi_$testId" } | ConvertTo-Json
    $paymentRes = Invoke-RestMethod -Uri "$BASE/payments/confirm-payment" -Method Post -Body $confirmBody -Headers $studentHeaders -ContentType "application/json"
    Test-Assert "Confirm Payment & Hold Escrow" ($paymentRes.session.status -eq "confirmed" -and $paymentRes.payment.amount -eq 60) "Commission: `$($paymentRes.payment.commission) | Payout: `$($paymentRes.payment.mentorPayout)"
} catch {
    Test-Assert "Session Booking & Payment Flow" $false $_.Exception.Message
}

# 6. Session Lifecycle Management
Write-Host "`n6. TESTING SESSION DASHBOARD & STATUS TRANSITIONS" -ForegroundColor Yellow
try {
    $studentSessions = Invoke-RestMethod -Uri "$BASE/sessions/mine" -Method Get -Headers $studentHeaders
    Test-Assert "Get My Sessions (Student Dashboard)" ($studentSessions.Count -gt 0) "Total student sessions: $($studentSessions.Count)"

    $mentorSessions = Invoke-RestMethod -Uri "$BASE/sessions/mine" -Method Get -Headers $mentorHeaders
    Test-Assert "Get My Sessions (Mentor Dashboard)" ($mentorSessions.Count -gt 0) "Total mentor sessions: $($mentorSessions.Count)"

    # Complete the session (Mentor updates status to completed)
    $statusUpdateBody = @{ status = "completed" } | ConvertTo-Json
    $completedSession = Invoke-RestMethod -Uri "$BASE/sessions/$sessionId/status" -Method Patch -Body $statusUpdateBody -Headers $mentorHeaders -ContentType "application/json"
    Test-Assert "Complete Session (PATCH /api/sessions/:id/status)" ($completedSession.status -eq "completed") "Status updated to: completed"
} catch {
    Test-Assert "Session Lifecycle Management" $false $_.Exception.Message
}

# 7. Review & Rating Flow
Write-Host "`n7. TESTING REVIEWS & RATING ENGINE" -ForegroundColor Yellow
try {
    $reviewBody = @{
        mentorId = $mentorProfileId
        sessionId = $sessionId
        rating = 5
        comment = "Outstanding React session! Extremely knowledgeable mentor."
    } | ConvertTo-Json

    $reviewRes = Invoke-RestMethod -Uri "$BASE/reviews" -Method Post -Body $reviewBody -Headers $studentHeaders -ContentType "application/json"
    Test-Assert "Post Session Review" ($reviewRes.rating -eq 5) "Review created ID: $($reviewRes._id)"

    # Verify Review Fetch
    $mentorReviews = Invoke-RestMethod -Uri "$BASE/reviews/mentor/$mentorProfileId" -Method Get
    Test-Assert "Fetch Mentor Reviews" ($mentorReviews.Count -gt 0) "Found $($mentorReviews.Count) review(s)"

    # Check updated mentor rating
    $updatedMentor = Invoke-RestMethod -Uri "$BASE/mentors/$mentorProfileId" -Method Get
    Test-Assert "Mentor Rating Auto-Update" ($updatedMentor.rating.avg -eq 5 -and $updatedMentor.rating.count -eq 1) "Avg Rating: $($updatedMentor.rating.avg) ⭐ ($($updatedMentor.rating.count) reviews)"
} catch {
    Test-Assert "Review & Rating Flow" $false $_.Exception.Message
}

# SUMMARY REPORT
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "                TESTING SUMMARY RESULTS                    " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PASSED CHECKS : $passed" -ForegroundColor Green
Write-Host "  FAILED CHECKS : $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "============================================================" -ForegroundColor Cyan

if ($failed -eq 0) {
    Write-Host "`n[SUCCESS] ALL MODULES OPERATIONAL AND WORKING PERFECTLY!`n" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] SOME MODULES ENCOUNTERED ISSUES!`n" -ForegroundColor Red
}
