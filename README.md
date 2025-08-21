# Overlord

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/itskempf/Overlord-/main.yml?branch=main&style=for-the-badge)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/itskempf/Overlord-?style=for-the-badge)
![GitHub license](https://img.shields.io/github/license/itskempf/Overlord-?style=for-the-badge)

A lightweight, open-source game server management panel for Windows, built with Electron and React.

---

## About The Project

Overlord is a Windows-first, open-source game server panel designed to be simple, powerful, and lightweight. It combines the best features from leading solutions into a user-friendly package that anyone can install and run without technical complexity.

The core philosophy is to provide a tool that's easy enough for a casual gamer to manage a server for their mates, but powerful enough for a dedicated admin to rely on.

### Key Features

* **Windows First:** Designed from the ground up for Windows 10/11.
* **Automatic SteamCMD Integration:** Downloads and manages SteamCMD automatically.
* **One-Click Server Installation:** Install dedicated game servers with just a Steam App ID.
* **Server Management:** Start, stop, and monitor your server processes.
* **Smart Config Editor:** A user-friendly form for editing server config files, not just a plain text box.
* **Backup & Restore System:** Create and restore backups of your server files to prevent data loss.

---

## Getting Started

### For Users (The Easy Way)

The easiest way to get started is to download the latest official release.

1.  Go to the **[Releases page](https://github.com/itskempf/Overlord-/releases)** on GitHub.
2.  Under the latest release, find and download the `Overlord-Setup-X.X.X.exe` file.
3.  Run the installer. Windows may show a security warning; you may need to click "More info" and "Run anyway".
4.  Launch Overlord from your Desktop or Start Menu.

### For Developers (The Hard Way)

If you want to run or contribute to the development of Overlord, you'll need to build it from the source code.

#### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version)
* [Git](https://git-scm.com/)

#### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/itskempf/Overlord-.git](https://github.com/itskempf/Overlord-.git)
    cd Overlord-
    ```

2.  **Install all dependencies:**
    *(This uses workspaces to install for the client, server, and shared packages at once)*
    ```bash
    npm install
    ```

3.  **Run the application in development mode:**
    *(This will start the backend server and launch the Electron desktop app)*
    ```bash
    npm run dev
    ```

---

## Contributing

Overlord is an open-source project, and contributions are absolutely welcome! If you're interested in helping make this the best damn game server panel for Windows, you've come to the right place.

Please check out the open issues to see where you can help. If you have a great idea, feel free to open a new issue to discuss it.

---

## License

Distributed under the CC BY-NC-SA 4.0 License. See `LICENSE` for more information.