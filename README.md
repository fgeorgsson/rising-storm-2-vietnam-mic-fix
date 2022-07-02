# Microphone fix for Rising Storm 2 Vietnam

The game does not feature any way to select which microphone should be used, so if you have multiple input ports your team will not be able to hear you. This app will list the devices that Rising Storm has detected and will allow you to pick which one you want to use.

## NOTE write protection

Rising Storm 2 will automatically overwrite the selected microphone index with whatever it likes, so to prevent that from happening this app will make the file *read only*. This means you can not make any changes to the game's settings until you remove the read only checkbox. There's a button in the app to do that. Just rerun mic fix and reselect the mic you need and hit save after updating your other settings like keybindings and video settings.

## NOTE blue powershell window flash

Powershell is used to fetch the friendly name for your devices. RS2 only keeps the GUID of each device which doesn't help very much. The GUID is matched against the devices that powershell can list, so that's why the blue powershell window shows up for a second whenever the configuration is reloaded (and on app start).

# Screenshot

![image](https://user-images.githubusercontent.com/849009/177014723-44278bef-204c-4e87-8c1c-05575506e788.png)
