# ValoVault

ValoVault adds the most demanded feature to the game: **Agent Skin Presets**

Create skin presets and assign agents, the skins will automatically apply if you select an agent ingame

<img width="1658" height="933" alt="image" src="https://github.com/user-attachments/assets/dece439e-0fa4-4d18-976a-553deb673c1b" />

## Supported game modes

- Competitive
- Unrated
- Custom
- Skirmish
- Swiftplay
- TDM
- Spikerush
- Escalation

## Features

-   **Create Presets:** Save your favorite combinations of weapon skins as presets.
-   **Apply Presets:** Quickly apply a saved preset to your current loadout.
-   **Agent-Specific Presets:** Assign different presets to your favorite agents.
-   **Auto-Apply (Optional):** Enable the "Auto Select Agent" feature to automatically apply a preset when you lock in an agent in-game.

## How to Use

Showcase: [YouTube](https://www.youtube.com/watch?v=IBO6WpkKm04)

1.  **Download:** Get the latest version of ValoVault from the [GitHub Releases](https://github.com/truearken/valovault/releases) page. Download the `.msi` installer for Windows.
2.  **Install:** Run the downloaded installer.
3.  **Launch Valorant:** Open Valorant and log in.
4.  **Launch ValoVault:** Open the ValoVault application. The app will automatically connect to your Valorant client.

## Technology Stack

ValoVault is built with a [**Go**](https://go.dev/) backend and a web-based frontend wrapped in a native desktop application using [**Tauri**](https://tauri.app/) and [**Next.js**](https://nextjs.org/) (using [**React**](https://react.dev/)).

## For Developers

Interested in contributing? Here's how to get the development environment set up.

### Prerequisites

-   [Go](https://go.dev/doc/install)
-   [Node.js](https://nodejs.org/en/download)
-   [Tauri](https://tauri.app/start/prerequisites/)

### Setup & Running

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/truearken/valovault.git
    cd valovault
    ```

2.  **Install frontend dependencies:**
    ```sh
    cd frontend
    npm install
    ```

3.  **Run the backend:**
    Open a new terminal in the root directory.
    ```sh
    cd backend && air
    ```
    This uses [air](https://github.com/air-verse/air) for live reloading the Go server. 
    If not installed yet install it or run it nativily with `go run .`.

4.  **Run the frontend (with Tauri):**
    Open another terminal in the root directory.
    ```sh
    cd frontend && npx tauri dev
    ```
    This will start the Next.js development server and launch the Tauri application.
