$ErrorActionPreference = "Stop"

$workspace = "C:\Users\sohho\Documents\GitHub\lit_hack"
$output = Join-Path $workspace "public\LARP_Demo_Deck.pptx"
$preview = Join-Path $workspace ".codex-build\deck-preview"
$techStack = "C:\Users\sohho\.codex\generated_images\01a07123-a983-7951-975a-cd268116180c\exec-18cc4f30-ada6-4d48-be8b-371455128ecb.png"

function Color([int]$r, [int]$g, [int]$b) { return $r + (256 * $g) + (65536 * $b) }

$navy = Color 20 31 51
$gold = Color 178 139 67
$paper = Color 247 244 238
$white = Color 255 255 255
$ink = Color 24 28 35
$muted = Color 100 105 112
$line = Color 207 202 191
$crimson = Color 155 34 38
$green = Color 35 112 84
$paleGold = Color 241 233 217
$paleBlue = Color 231 237 242

function Add-Rect($slide, $x, $y, $w, $h, $fill, $stroke = $null, $strokeWidth = 1) {
  $shape = $slide.Shapes.AddShape(1, $x, $y, $w, $h)
  $shape.Fill.Solid()
  $shape.Fill.ForeColor.RGB = $fill
  if ($null -eq $stroke) { $shape.Line.Visible = 0 } else { $shape.Line.Visible = -1; $shape.Line.ForeColor.RGB = $stroke; $shape.Line.Weight = $strokeWidth }
  return $shape
}

function Add-Line($slide, $x1, $y1, $x2, $y2, $color = $line, $width = 1.2, $arrow = $false) {
  $shape = $slide.Shapes.AddLine($x1, $y1, $x2, $y2)
  $shape.Line.ForeColor.RGB = $color
  $shape.Line.Weight = [single]$width
  if ($arrow) { $shape.Line.EndArrowheadStyle = 3 }
  return $shape
}

function Add-Text($slide, $text, $x, $y, $w, $h, $size = 18, $color = $ink, $bold = $false, $font = "Aptos", $align = 1, $valign = 1) {
  $shape = $slide.Shapes.AddTextbox(1, $x, $y, $w, $h)
  $shape.Fill.Visible = 0
  $shape.Line.Visible = 0
  $shape.TextFrame.MarginLeft = 0
  $shape.TextFrame.MarginRight = 0
  $shape.TextFrame.MarginTop = 0
  $shape.TextFrame.MarginBottom = 0
  $shape.TextFrame.WordWrap = -1
  $range = $shape.TextFrame.TextRange
  $range.Text = $text
  $range.Font.Name = $font
  $range.Font.Size = $size
  $range.Font.Color.RGB = $color
  $range.Font.Bold = if ($bold) { -1 } else { 0 }
  $range.ParagraphFormat.Alignment = $align
  $shape.TextFrame.VerticalAnchor = $valign
  return $shape
}

function Add-Title($slide, $title, $number) {
  Add-Rect $slide 0 0 960 8 $gold | Out-Null
  Add-Text $slide $title 54 34 760 50 27 $navy $true "Georgia" | Out-Null
  Add-Text $slide ("0" + $number) 860 40 48 24 11 $gold $true "Aptos" 3 | Out-Null
  Add-Line $slide 54 94 906 94 $line 1 | Out-Null
}

function Add-Footer($slide, $text = "L.A.R.P.  |  SMU LIT Hackathon 2026") {
  Add-Text $slide $text 54 511 520 14 8 $muted $false "Aptos" | Out-Null
}

function Add-Stage($slide, $number, $title, $body, $x, $y, $w, $accent = $gold, $titleColor = $navy, $bodyColor = $muted) {
  Add-Text $slide $number $x $y 32 32 19 $accent $true "Georgia" 2 3 | Out-Null
  Add-Line $slide ($x + 40) ($y + 15) ($x + 70) ($y + 15) $accent 2 | Out-Null
  Add-Text $slide $title ($x + 80) ($y - 1) ($w - 80) 25 15 $titleColor $true | Out-Null
  Add-Text $slide $body ($x + 80) ($y + 26) ($w - 80) 42 11 $bodyColor $false | Out-Null
}

$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = -1
$presentation = $ppt.Presentations.Add()
$presentation.PageSetup.SlideWidth = 960
$presentation.PageSetup.SlideHeight = 540

try {
  # 1 — Cover
  $s = $presentation.Slides.Add(1, 12)
  $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = $navy
  Add-Rect $s 0 0 960 540 $navy | Out-Null
  Add-Rect $s 0 0 12 540 $gold | Out-Null
  Add-Text $s "L.A.R.P." 70 92 500 78 50 $paper $true "Georgia" | Out-Null
  Add-Text $s "LOCALISED AMENDMENT RESILIENCE PLATFORM" 73 177 650 22 13 $gold $true "Aptos" | Out-Null
  Add-Line $s 73 219 370 219 $gold 2 | Out-Null
  Add-Text $s "Regulatory change, traced to the clauses and files that need attention" 73 252 650 112 27 $paper $false "Georgia" | Out-Null
  Add-Text $s "Singapore LegalTech  ·  SMU LIT Hackathon 2026" 73 462 560 20 11 (Color 187 196 207) $false | Out-Null
  Add-Text $s "HUMAN REVIEW REMAINS FINAL" 720 465 175 18 9 $gold $true "Aptos" 3 | Out-Null

  # 2 — Problem
  $s = $presentation.Slides.Add(2, 12); $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = $paper
  Add-Title $s "Regulatory alerts stop too early" 2
  Add-Text $s "Existing horizon scanners answer one question" 55 126 390 28 14 $muted $false | Out-Null
  Add-Text $s "What changed in the law?" 55 158 390 50 28 $navy $true "Georgia" | Out-Null
  Add-Line $s 455 132 455 424 $line 1 | Out-Null
  Add-Text $s "Lawyers still have to answer the operational question" 505 126 400 28 14 $muted $false | Out-Null
  Add-Text $s "Which confidential files now need review?" 505 158 400 82 28 $crimson $true "Georgia" | Out-Null
  $steps = @(
    @("1", "Read the alert", 60),
    @("2", "Search document stores", 275),
    @("3", "Compare clauses manually", 490),
    @("4", "Draft and validate changes", 705)
  )
  foreach ($step in $steps) {
    Add-Text $s $step[0] $step[2] 312 30 30 13 $gold $true "Aptos" 2 3 | Out-Null
    Add-Text $s $step[1] ($step[2] + 38) 308 160 38 12 $navy $true | Out-Null
  }
  Add-Line $s 95 365 820 365 $line 2 $true | Out-Null
  Add-Rect $s 265 391 450 46 (Color 245 231 231) $crimson 1 | Out-Null
  Add-Text $s "Manual search and clause review consume billable time and can miss affected files" 285 404 410 20 12 $crimson $true "Aptos" 2 | Out-Null
  Add-Footer $s

  # 3 — Product flow
  $s = $presentation.Slides.Add(3, 12); $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = $white
  Add-Title $s "One workflow from source to working copy" 3
  $flow = @(
    @("01", "MONITOR", "Official Acts, Bills and consultations"),
    @("02", "COMPARE", "Past and present legal text"),
    @("03", "TRACE", "Affected contract families and clauses"),
    @("04", "REVIEW", "AI suggestions with legal sources"),
    @("05", "DOWNLOAD", "Approved Word working copy")
  )
  for ($i=0; $i -lt $flow.Count; $i++) {
    $x = 55 + ($i * 177)
    Add-Text $s $flow[$i][0] $x 145 60 35 22 $gold $true "Georgia" | Out-Null
    Add-Line $s $x 190 ($x + 128) 190 $gold 2 | Out-Null
    Add-Text $s $flow[$i][1] $x 212 135 25 13 $navy $true | Out-Null
    Add-Text $s $flow[$i][2] $x 249 140 68 12 $muted $false | Out-Null
    if ($i -lt 4) { Add-Line $s ($x + 143) 190 ($x + 168) 190 $line 1.5 $true | Out-Null }
  }
  Add-Rect $s 55 373 850 67 $navy | Out-Null
  Add-Text $s "The source contract stays untouched in Cloudflare R2" 79 390 510 24 17 $paper $true "Georgia" | Out-Null
  Add-Text $s "Only the downloaded working copy contains approved edits" 628 393 245 34 11 (Color 191 199 208) $false "Aptos" 3 | Out-Null
  Add-Footer $s

  # 4 — Demo route
  $s = $presentation.Slides.Add(4, 12); $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = $paper
  Add-Title $s "Demo route: PDPA and Workplace Fairness" 4
  Add-Rect $s 55 126 395 190 $navy | Out-Null
  Add-Text $s "PDPA" 78 148 90 22 12 $gold $true | Out-Null
  Add-Text $s "Current compliance review" 78 183 320 34 22 $paper $true "Georgia" | Out-Null
  Add-Text $s "Historical comparison and commenced duties`nPriority screening for privacy clauses`nClause-level diff review" 78 235 318 68 12 (Color 203 209 216) $false | Out-Null
  Add-Rect $s 475 126 430 190 $white $line 1 | Out-Null
  Add-Text $s "WORKPLACE FAIRNESS ACT" 498 148 220 22 12 $gold $true | Out-Null
  Add-Text $s "Future readiness review" 498 183 350 34 22 $navy $true "Georgia" | Out-Null
  Add-Text $s "Passed but uncommenced`nEmployment document screening`nPreparation without false breach findings" 498 235 350 68 12 $muted $false | Out-Null
  Add-Text $s "LIVE DEMO" 55 352 110 18 10 $gold $true | Out-Null
  $demo = @("Pick a law", "Read the summary and timeline", "Filter affected files", "Trace the dependency", "Accept or reject edits")
  for ($i=0; $i -lt $demo.Count; $i++) {
    $x = 55 + ($i * 170)
    Add-Text $s ($i + 1).ToString() $x 389 25 25 12 $white $true "Aptos" 2 3 | Out-Null
    $circle = $s.Shapes.AddShape(9, $x, 389, 25, 25); $circle.Fill.Solid(); $circle.Fill.ForeColor.RGB = $gold; $circle.Line.Visible = 0; $circle.ZOrder(1)
    Add-Text $s $demo[$i] ($x + 34) 384 126 42 11 $navy $true | Out-Null
    if ($i -lt 4) { Add-Line $s ($x + 153) 402 ($x + 167) 402 $line 1 $true | Out-Null }
  }
  Add-Footer $s

  # 5 — Safeguards
  $s = $presentation.Slides.Add(5, 12); $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = $white
  Add-Title $s "Evidence and human control" 5
  Add-Stage $s "01" "Official evidence" "Singapore Statutes Online and approved government sources ground the legal position." 55 132 390 $gold
  Add-Stage $s "02" "AI draft" "The model proposes summaries and clause changes. It does not make the final legal decision." 515 132 390 $gold
  Add-Stage $s "03" "Cached review" "Stored results avoid repeat processing and preserve the basis for each priority." 55 250 390 $green
  Add-Stage $s "04" "Lawyer approval" "Counsel accepts, rejects or edits every change before downloading a working copy." 515 250 390 $green
  Add-Rect $s 55 385 850 66 $navy | Out-Null
  Add-Text $s "SERVER" 78 403 75 15 9 $gold $true | Out-Null
  Add-Text $s "Credentials remain server-side" 78 421 205 18 11 $paper $false | Out-Null
  Add-Text $s "STORAGE" 338 403 75 15 9 $gold $true | Out-Null
  Add-Text $s "R2 originals remain read-only" 338 421 210 18 11 $paper $false | Out-Null
  Add-Text $s "OUTPUT" 603 403 75 15 9 $gold $true | Out-Null
  Add-Text $s "Approved edits download as a copy" 603 421 260 18 11 $paper $false | Out-Null
  Add-Footer $s

  # 6 — Technology stack image
  $s = $presentation.Slides.Add(6, 12); $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = (Color 15 18 24)
  $s.Shapes.AddPicture($techStack, 0, -1, 75, 0, 810, 540) | Out-Null
  Add-Text $s "06" 893 20 30 18 9 $gold $true "Aptos" 3 | Out-Null

  # 7 — Roadmap and close
  $s = $presentation.Slides.Add(7, 12); $s.Background.Fill.Solid(); $s.Background.Fill.ForeColor.RGB = $navy
  Add-Rect $s 0 0 960 540 $navy | Out-Null
  Add-Rect $s 0 0 12 540 $gold | Out-Null
  Add-Text $s "What comes next" 70 54 500 48 30 $paper $true "Georgia" | Out-Null
  Add-Line $s 70 118 890 118 (Color 74 84 102) 1 | Out-Null
  Add-Stage $s "01" "Microsoft Word Track Changes" "Accepted suggestions appear as native reviewable edits in active agreements." 70 158 390 $gold $paper (Color 187 196 207)
  Add-Stage $s "02" "Billable review timer" "Review time is recorded by document and client matter." 510 158 380 $gold $paper (Color 187 196 207)
  Add-Stage $s "03" "Earlier Bill monitoring" "Legal teams can prepare documents before commencement dates arrive." 70 282 390 $gold $paper (Color 187 196 207)
  Add-Stage $s "04" "Law firm pilots" "Real matters will test relevance, drafting quality and review speed." 510 282 380 $gold $paper (Color 187 196 207)
  Add-Text $s "Regulatory monitoring becomes a review queue lawyers can act on" 70 430 730 48 23 $paper $true "Georgia" | Out-Null
  Add-Text $s "L.A.R.P." 806 448 84 20 11 $gold $true "Aptos" 3 | Out-Null

  if (Test-Path $output) { Remove-Item -LiteralPath $output -Force }
  $presentation.SaveAs($output, 24)
  if (Test-Path $preview) { Remove-Item -LiteralPath $preview -Recurse -Force }
  New-Item -ItemType Directory -Path $preview | Out-Null
  $presentation.Export($preview, "PNG", 1600, 900)
}
finally {
  $presentation.Close()
  $ppt.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
  [GC]::Collect(); [GC]::WaitForPendingFinalizers()
}

Write-Output $output
