# TPKCAB

## Requirements

See [Set up Forge](https://developer.atlassian.com/platform/forge/getting-started) for instructions to get set up.

## Staring the App

- Run these commands to register the app and installing dependicies

```
forge register
npm install or npm install --legacy-peer-deps (if npm install doesn't work)
```

- Modify your app by editing the files in `static/`:

- Build your app and start it in root folder:

```
npm run build
npm run dev
```

- Move on to the parent folder and follow below instructions:

- Deploy your app by running:

```
forge deploy
```

- Install your app in an Atlassian site by running:

```
forge install
```

- Display the changes you made in your app by running:

```
forge tunnel
```
