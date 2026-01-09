# ===============================
# Angular App Folder Scaffolding
# ===============================

$base = "src/app"

$paths = @(
    "$base/core/guards",
    "$base/core/interceptors",
    "$base/core/services",

    "$base/shared/components/topbar",
    "$base/shared/components/sidenav",
    "$base/shared/components/card",
    "$base/shared/styles",

    "$base/features/auth/pages/login",

    "$base/features/calendar/pages/calendar-page",
    "$base/features/calendar/components/calendar-toolbar",
    "$base/features/calendar/components/calendar-grid",
    "$base/features/calendar/components/calendar-options-card",
    "$base/features/calendar/components/tags-card",
    "$base/features/calendar/components/users-card",

    "$base/layouts/public-layout",
    "$base/layouts/app-layout"
)

$files = @(
    # shared components
    "$base/shared/components/topbar/topbar.component.ts",
    "$base/shared/components/topbar/topbar.component.html",
    "$base/shared/components/topbar/topbar.component.scss",

    "$base/shared/components/sidenav/sidenav.component.ts",
    "$base/shared/components/sidenav/sidenav.component.html",
    "$base/shared/components/sidenav/sidenav.component.scss",

    "$base/shared/components/card/card.component.ts",
    "$base/shared/components/card/card.component.html",
    "$base/shared/components/card/card.component.scss",

    "$base/shared/styles/_palette.scss",

    # auth - login
    "$base/features/auth/pages/login/login.component.ts",
    "$base/features/auth/pages/login/login.component.html",
    "$base/features/auth/pages/login/login.component.scss",

    # calendar page
    "$base/features/calendar/pages/calendar-page/calendar-page.component.ts",
    "$base/features/calendar/pages/calendar-page/calendar-page.component.html",
    "$base/features/calendar/pages/calendar-page/calendar-page.component.scss",

    # calendar subcomponents
    "$base/features/calendar/components/calendar-toolbar/calendar-toolbar.component.ts",
    "$base/features/calendar/components/calendar-toolbar/calendar-toolbar.component.html",
    "$base/features/calendar/components/calendar-toolbar/calendar-toolbar.component.scss",

    "$base/features/calendar/components/calendar-grid/calendar-grid.component.ts",
    "$base/features/calendar/components/calendar-grid/calendar-grid.component.html",
    "$base/features/calendar/components/calendar-grid/calendar-grid.component.scss",

    "$base/features/calendar/components/calendar-options-card/calendar-options-card.component.ts",
    "$base/features/calendar/components/calendar-options-card/calendar-options-card.component.html",
    "$base/features/calendar/components/calendar-options-card/calendar-options-card.component.scss",

    "$base/features/calendar/components/tags-card/tags-card.component.ts",
    "$base/features/calendar/components/tags-card/tags-card.component.html",
    "$base/features/calendar/components/tags-card/tags-card.component.scss",

    "$base/features/calendar/components/users-card/users-card.component.ts",
    "$base/features/calendar/components/users-card/users-card.component.html",
    "$base/features/calendar/components/users-card/users-card.component.scss",

    # layouts
    "$base/layouts/public-layout/public-layout.component.ts",
    "$base/layouts/public-layout/public-layout.component.html",

    "$base/layouts/app-layout/app-layout.component.ts",
    "$base/layouts/app-layout/app-layout.component.html"
)

# Create folders
foreach ($path in $paths) {
    if (!(Test-Path $path)) {
        New-Item -ItemType Directory -Path $path | Out-Null
    }
}

# Create files
foreach ($file in $files) {
    if (!(Test-Path $file)) {
        New-Item -ItemType File -Path $file | Out-Null
    }
}

Write-Host "Angular scaffolding complete."
