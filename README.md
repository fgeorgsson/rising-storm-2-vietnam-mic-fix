# Microphone fix for Rising Storm 2 Vietnam

The game does not feature any way to select which microphone should be used, so if you have multiple input ports your team will not be able to hear you. This app will list the devices that Rising Storm has detected and will allow you to pick which one you want to use.

## NOTE write protection

The app will remove write protection from the config file on save.
## NOTE blue powershell window flash

Powershell is used to fetch the friendly name for your devices. RS2 only keeps the GUID of each device which doesn't help very much. The GUID is matched against the devices that powershell can list, so that's why the blue powershell window shows up for a second whenever the configuration is reloaded (and on app start).

# Screenshot

![image](https://user-images.githubusercontent.com/849009/177014723-44278bef-204c-4e87-8c1c-05575506e788.png)
