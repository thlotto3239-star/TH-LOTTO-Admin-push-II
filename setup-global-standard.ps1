# =====================================================================
# ARM AI Engineering Standard (ARM-AES v1.0) Global Installer for Antigravity
# =====================================================================

$globalGeminiDir = Join-Path $env:USERPROFILE ".gemini\config"
$globalRulesDir  = Join-Path $globalGeminiDir "rules"
$globalSkillsDir = Join-Path $globalGeminiDir "skills"

Write-Host "`n🚀 [ARM-AES] Installing Global Standards & Skills to: $globalGeminiDir" -ForegroundColor Cyan

# 1. Ensure global directories exist
if (-not (Test-Path $globalRulesDir)) {
    New-Item -ItemType Directory -Path $globalRulesDir -Force | Out-Null
}
if (-not (Test-Path $globalSkillsDir)) {
    New-Item -ItemType Directory -Path $globalSkillsDir -Force | Out-Null
}

# 2. Copy Global Master Rule
$workspaceRule = Join-Path $PSScriptRoot ".agents\rules\arm-ai-engineering-standard.md"
if (Test-Path $workspaceRule) {
    Copy-Item -Path $workspaceRule -Destination (Join-Path $globalRulesDir "arm-ai-engineering-standard.md") -Force
    Write-Host "✅ [Global Rule] Successfully installed ARM-AES rule to $globalRulesDir" -ForegroundColor Green
}

# 3. Copy Global Skills
$workspaceSkills = Join-Path $PSScriptRoot ".agents\skills"
if (Test-Path $workspaceSkills) {
    $skills = Get-ChildItem -Path $workspaceSkills -Directory
    foreach ($skill in $skills) {
        $dest = Join-Path $globalSkillsDir $skill.Name
        Copy-Item -Path $skill.FullName -Destination $dest -Recurse -Force
    }
    Write-Host "✅ [Global Skills] Successfully installed $($skills.Count) skills to $globalSkillsDir" -ForegroundColor Green
}

Write-Host "`n🎉 [SUCCESS] ARM-AES Standard and Skills are now set as GLOBAL DEFAULTS for all projects in Antigravity IDE!" -ForegroundColor Yellow
