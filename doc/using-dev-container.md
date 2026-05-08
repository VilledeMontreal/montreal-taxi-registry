# Using a Dev Container

## Introduction

This guide explains how to set up and use a [Dev Container](https://containers.dev/) for local development.

If you are not familiar with Dev Containers, watch this introduction:
[Get Started with Dev Containers in VS Code](https://www.youtube.com/watch?v=b1RavPr_878)

If you are not familiar with WSL, watch this introduction:
[WSL Quick Start](https://www.youtube.com/watch?v=hvl70WhD85g)

---

## Windows Setup

### Prerequisites

Install the following tools:

1. [WSL 2 with the default Ubuntu distribution](https://learn.microsoft.com/en-us/windows/wsl/install)
2. [Rancher Desktop](https://rancherdesktop.io/)
3. [Visual Studio Code](https://code.visualstudio.com/)
4. VS Code extensions:
   - [WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
   - [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Configure Rancher Desktop

1. Open **Preferences > WSL** and check **Ubuntu** under *"Expose Rancher Desktop's Kubernetes configuration and Docker socket to Windows Subsystem for Linux (WSL) distros"*.
2. Under **Preferences > Container Engine**, select **dockerd (moby)**.
3. Under **Preferences > Kubernetes**, check **Enable Kubernetes**.

### Configure WSL

1. **Set Ubuntu as the default distribution.**

   List available distributions:
   ```powershell
   wsl -l -v
   ```
   Set the default:
   ```powershell
   wsl --set-default Ubuntu
   ```

2. **Configure Git credential sharing** so you don't have to enter your password on every commit inside WSL.

   Open a WSL terminal (type `WSL` in the Start menu) and run:
   ```bash
   git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
   ```

### Clone the Repository and Open the Dev Container

1. **Connect VS Code to WSL** using the button in the bottom-left corner (*Connect to WSL*).
   See [this video](https://www.youtube.com/watch?v=hvl70WhD85g) if needed.

   > **Important:** You must use WSL. File system performance is significantly faster under WSL than under the Windows file system when using Dev Containers.

2. **Clone the repository from within the WSL session** and open it in VS Code.

   > **Important:** Clone inside WSL, not on the Windows file system, otherwise performance will be very slow.

   > **Note:** It is recommended to use HTTPS rather than SSH to simplify credential configuration.

3. **Reopen in the Dev Container.** Click the bottom-left button and select *Reopen in Container*.
  See [this video](https://www.youtube.com/watch?v=b1RavPr_878) if needed.

   After this step, the execution context is the Dev Container. Any terminal you open will be a Linux terminal running inside the container. Conceptually, this is similar to working via Remote Desktop on a Linux machine.

   > **Note:** Once the Dev Container is running, you can view the active containers in Rancher Desktop.

### Troubleshooting

Some users who upgraded from Windows 10 to Windows 11 have reported WSL instability (WSL stops responding unexpectedly). A clean Windows 11 install resolved these issues.

If WSL becomes unresponsive, restart it with the following PowerShell command:

```powershell
Get-Service vmcompute | Restart-Service
```

---

## macOS Setup

The procedure is similar to Windows, but use [Colima](https://github.com/abiosoft/colima) as the container runtime instead of Rancher Desktop with WSL.
