# Translation Implementation Progress Checker
# Run this to see which files need translation updates

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "FIXORA TRANSLATION STATUS CHECKER" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$componentsToCheck = @(
    "src/components/Footer.tsx",
    "src/components/Features.tsx",
    "src/components/HowItWorks.tsx",
    "src/components/Assistant.tsx",
    "src/components/Overview.tsx",
    "src/components/UseCases.tsx",
    "src/components/About.tsx",
    "src/pages/ContactUs.tsx",
    "src/pages/HelpCenter.tsx",
    "src/pages/Documentation.tsx",
    "src/pages/VideoTutorials.tsx",
    "src/pages/CommunityChat.tsx",
    "src/pages/PrivacyPolicy.tsx",
    "src/pages/NotFound.tsx"
)

$alreadyImplemented = @("src/components/Navbar.tsx", "src/components/Hero.tsx")

Write-Host "✅ Already Implemented:" -ForegroundColor Green
foreach ($file in $alreadyImplemented) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "useLanguage") {
            Write-Host "   $file" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "⏳ Needs Translation Implementation:" -ForegroundColor Yellow
$needsUpdate = 0
foreach ($file in $componentsToCheck) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -notmatch "useLanguage") {
            Write-Host "   $file" -ForegroundColor Yellow
            $needsUpdate++
        } else {
            Write-Host "   $file (uses useLanguage)" -ForegroundColor Green
        }
    } else {
        Write-Host "   $file (file not found)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host "Files needing updates: $needsUpdate" -ForegroundColor Yellow
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 See TRANSLATION_IMPLEMENTATION_GUIDE.md for detailed instructions" -ForegroundColor Magenta
