# Figma Discord Presence

[![Build/release](https://github.com/bryanberger/figma-discord-presence/actions/workflows/deploy.yml/badge.svg)](https://github.com/bryanberger/figma-discord-presence/actions/workflows/deploy.yml)

<a href="https://www.producthunt.com/posts/figma-discord-presence?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-discord-presence" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=305303&theme=dark" alt="Figma Discord Presence - Adds rich presence activity to Discord for Figma | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

> Update your discord activity status with a rich presence from Figma.
> Supports Windows and MacOS

![demo](.github/demo.png?raw=true)

## Features

- Shows what you're working on in Figma
- Menubar application for convenient control and configuration
- Privacy configuration options for hiding filenames, activity status, and Figma view buttons
- Idle and active indication if you have tabbed out or are actively using Figma
- Respects Discords 15s status update limit, but, privacy options set immediately
- Support for manually reconnecting to the Discord Gateway
- Support for enabling or disabling presence reporting at will

## How does it work?

Figma does not support a native way to monitor the application state in the background (yet?), but, it does drop some state files on your machine.

This application periodically reads those files checking for updates and combines some information to determine whether Figma is in the foreground, what the current active file is, and a share link to that file.

Every ~15s your Figma activity is reported to Discord via the Discord RPC protocol.

## Troubleshooting

> Linux is currently not supported.
> This application requires Figma Desktop.
> Ensure that you have your activity status enabled in Discord, or your activity won't be visible to anyone.

**MacOS:**

- MacOS may ask for permission to control other apps. It is required to enable and communicate with Figma and Discord.
- This application assumes you install Figma Desktop normally, and have not changed or modified it in any way
- `~/Library/Saved\ Application\ State/com.figma.Desktop.savedState/windows.plist` must exist
- `~/Library/Application\ Support/Figma/settings.json` must exist
- It may take a few seconds for your activity to update to show the latest active/idle status and filename in Discord. Figma's `savedState` does not update in realtime. We could watch this file for changes and update your Discord activity when it does but since we try to honor Discord's 15s activity update limit, we currently just wait for the next tick to update your activity.

## Development

```bash
# Clone this repository
git clone https://github.com/bryanberger/figma-discord-presence

# Change directory
cd figma-discord-presence

# Copy and edit env vars
cp .env.example .env

# Install dependencies
npm install

# Run the app
npm start

# Build the electron binaries
npm run dist

# Publish (using the S3 Provider, make sure you're authenticated and have a bucket setup)
npm run publish
```

## Release

This project uses Github Actions to build for Windows and Mac. Upon successful build, if a git tag exists it will publish to S3 (given you've provided the proper access tokens).

When you want to create a new release, follow these steps:

- Update the version in your project's package.json file (e.g. 1.2.3)
- Commit that change (git commit -am v1.2.3)
- Tag your commit (git tag v1.2.3). Make sure your tag name's format is v*.*.*. Your workflow will use this tag to detect when to create a release
- Push your changes to GitHub (git push && git push --tags)

After building successfully, the action will publish your release artifacts.

## Contributing
To contribute to this repository, feel free to create a new fork of the repository and submit a pull request.

1. Fork / Clone and select the `master` branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here](https://github.com/bryanberger/figma-discord-presence/pulls)!

## Notice

While I am a Discord employee, this is by no way endorsed as an "official" integration with Figma. This is a personal project and is actually kind of a hacky solution to bring Rich Presence for Figma to Discord.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
