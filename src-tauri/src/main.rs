#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use powershell_script::PsScriptBuilder;
use std::env;
use std::fs;

#[tauri::command]
fn get_engine_config() -> Result<String, String> {
  match get_config_path_full() {
    Ok(config_path_full) => {
      let contents = fs::read_to_string(config_path_full)
        .expect("Something went wrong reading the file");
      return Ok(contents);
    }
    Err(_) => {
      println!("Impossible to get your home dir!");
      let contents: String = "".to_string();
      return Ok(contents);
    }
  }
}

#[tauri::command]
fn remove_write_lock() -> Result<String, String> {
  match get_config_path_full() {
    Ok(config_path_full) => {
      let mut new_perms = fs::metadata(&config_path_full).unwrap().permissions();
      new_perms.set_readonly(false);
      match fs::set_permissions(&config_path_full, new_perms) {
        Ok(_) => return Ok("Success".into()),
        Err(_) => return Err("Something went wrong removing read only flag from config file".into())
      }
    },
    Err(_) => return Err("Impossible to get your home dir".into())
  }
}

#[tauri::command]
fn set_write_lock() -> Result<String, String> {
  match get_config_path_full() {
    Ok(config_path_full) => {
      let mut new_perms = fs::metadata(&config_path_full).unwrap().permissions();
      new_perms.set_readonly(true);
      match fs::set_permissions(&config_path_full, new_perms) {
        Ok(_) => return Ok("Success".into()),
        Err(_) => return Err("Something went wrong adding read only flag to config file".into())
      }
    },
    Err(_) => return Err("Impossible to get your home dir".into())
  }
}

fn get_config_path_full() -> Result<String, String> {
  match home::home_dir() {
    Some(path) => {
      let config_path: String =
          "\\Documents\\My Games\\Rising Storm 2\\ROGame\\Config\\ROEngine.ini".to_owned();

      match path.to_str() {
        Some(path_str_ref) => {
          let config_path_full = path_str_ref.to_owned() + &config_path;
          println!("config_path_full {}", config_path_full);
          return Ok(config_path_full);
        }
        None => return Err("Impossible to get your home dir".into()),
      }
    }
    None => Err("Impossible to get your home dir".into()),
  }
}

#[tauri::command]
fn set_engine_config(new_config: String) -> Result<String, String> {
  match remove_write_lock() {
    Ok(_) => {},
    Err(msg) => return Err(msg)
  }
  match get_config_path_full() {
    Ok(config_path_full) => {
      match fs::write(&config_path_full, new_config) {
        Ok(_) => {},
        Err(_) => return Err("Something went wrong writing new config".into())
      }
    },
    Err(_) => return Err("Could not get home dir".into()),
  }

  return Ok("Success".into());
}

#[tauri::command]
fn get_devices() -> Result<String, String> {
  const CMD: &str = "chcp 65001\nGet-PnpDevice -Class AudioEndpoint | Select-Object -Property FriendlyName,InstanceId";
  let ps = PsScriptBuilder::new()
    .no_profile(true)
    .non_interactive(true)
    .hidden(false)
    .print_commands(false)
    .build();
  let device_data = ps.run(CMD).unwrap();  
  return Ok(device_data.to_string());
}

fn main() {
  let context = tauri::generate_context!();
  tauri::Builder::default()
      .menu(if cfg!(target_os = "macos") {
          tauri::Menu::os_default(&context.package_info().name)
      } else {
          tauri::Menu::default()
      })
      .manage(String::from("test"))
      .invoke_handler(tauri::generate_handler![
          get_engine_config,
          set_engine_config,
          get_devices,
          remove_write_lock,
          set_write_lock
      ])
      .run(context)
      .expect("error while running tauri application");
}
