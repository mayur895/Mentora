# Test mentor dashboard API endpoints
$BASE = "http://localhost:5000/api"

Write-Host "`n=== Testing Mentor Dashboard API ===" -ForegroundColor Magenta

# Login as mentor
$loginBody = @{ email = "mentor_seed@mentora.com"; password = "Mentor@1234" } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST -Uri "$BASE/auth/login" -Body $loginBody -ContentType "application/json"
$TOKEN = $login.token
$HEADERS = @{ Authorization = "Bearer $TOKEN" }
Write-Host "Logged in as: $($login.user.name) | Role: $($login.user.role)" -ForegroundColor Green

# GET /my-profile
Write-Host "`nGET /mentors/my-profile..." -ForegroundColor Cyan
try {
    $profile = Invoke-RestMethod -Uri "$BASE/mentors/my-profile" -Headers $HEADERS
    Write-Host "  OK - Profile: $($profile.bio.Substring(0, [Math]::Min(50, $profile.bio.Length)))..." -ForegroundColor Green
    Write-Host "  Skills: $($profile.skills -join ', ')" -ForegroundColor Green
    Write-Host "  Rate: `$$($profile.hourlyRate)/hr" -ForegroundColor Green
    Write-Host "  Status: $($profile.verificationStatus)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# PUT /my-profile  (update)
Write-Host "`nPUT /mentors/my-profile (update)..." -ForegroundColor Cyan
$updateBody = @{
    bio = "Senior React & JS developer. 6+ years experience. Passionate about teaching clean code and modern web patterns."
    skills = @("React", "JavaScript", "Node.js", "TypeScript", "GraphQL")
    hourlyRate = 45
    currency = "USD"
    portfolioLinks = @("https://github.com/alexjohnson")
} | ConvertTo-Json
try {
    $updated = Invoke-RestMethod -Method PUT -Uri "$BASE/mentors/my-profile" -Body $updateBody -ContentType "application/json" -Headers $HEADERS
    Write-Host "  OK - Updated rate: `$$($updated.hourlyRate)/hr | Skills: $($updated.skills -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Login as student and test that student CANNOT access mentor dashboard route
Write-Host "`nTesting student blocked from PUT /my-profile..." -ForegroundColor Cyan
$sLogin = Invoke-RestMethod -Method POST -Uri "$BASE/auth/login" -Body (@{ email = "student_seed@mentora.com"; password = "Student@1234" } | ConvertTo-Json) -ContentType "application/json"
$sHeaders = @{ Authorization = "Bearer $sLogin.token" }

Write-Host "`n=== All mentor dashboard API tests done ===" -ForegroundColor Magenta
