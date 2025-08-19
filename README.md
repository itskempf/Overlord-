---

# Overlord - Game Server Management App

Overlord is a desktop application for Windows designed to simplify the management of game servers.



## For Users: Installing and Running Overlord

The easiest way to get started is to download the latest official release.

1.  Go to the **[Releases page](https://github.com/itskempf/Overlord/releases)** on GitHub.
2.  Under the latest release, find the file named `Overlord-Setup-X.X.X.exe` (the 'X's will be the version number).
3.  Download and run the `.exe` installer. Windows may show a security warning because the app is not code-signed; you may need to click "More info" and "Run anyway".
4.  Once installed, you can launch Overlord from your Desktop or Start Menu just like any other application.

## For Developers: Building From Source

If you want to run or contribute to the development of Overlord, you will need to build it from the source code.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Git](https://git-scm.com/)

### Setup and Running in Dev Mode

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/itskempf/Overlord.git](https://github.com/itskempf/Overlord.git)
    cd Overlord
    ```

2.  **Install all dependencies:**
    *(This will install dependencies for the server, client, and shared packages at once)*
    ```bash
    npm install
    ```

3.  **Run the application:**
    *(This will start the React frontend and launch it in an Electron desktop window)*
    ```bash
    cd client
    npm run electron:dev
    ```

### Building the Executable

To package the application into a distributable `.exe` file yourself:

1.  Navigate to the client directory:
    ```bash
    cd client
    ```

2.  Run the build script:
    ```bash
    npm run electron:build
    ```

3.  The completed installer will be located in the `/client/dist/` directory.

---
