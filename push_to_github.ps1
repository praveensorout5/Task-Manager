# Simple Push to GitHub Script
$repoUrl = "https://github.com/praveensorout5/Task-Manager.git"

Write-Host "Pushing TaskFlow to GitHub..."

# Remove origin if it exists to be safe
git remote remove origin 2>$null

# Add remote
git remote add origin $repoUrl

# Branch management
git branch -M main

# Push
Write-Host "Pushing to $repoUrl..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success: Pushed to GitHub!"
} else {
    Write-Host "Error: Push failed."
}
