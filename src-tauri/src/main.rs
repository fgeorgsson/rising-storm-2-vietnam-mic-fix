#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::env;
use std::fs;
use tauri::State;

#[tauri::command]
fn get_engine_config() -> Result<String, String> {
  match env::home_dir() {
    Some(path) => {
      let configPath: String = "\\Documents\\My Games\\Rising Storm 2\\ROGame\\Config\\ROEngine.ini".to_owned();
      let configPathFull: String;

      match path.to_str() {
        Some(pathAsStrRef) => {
          println!("Home path {}", pathAsStrRef.to_string());
          configPathFull = pathAsStrRef.to_owned() + &configPath;
          println!("configPathFull {}", configPathFull);

          let contents = fs::read_to_string(configPathFull).expect("Something went wrong reading the file");
          println!("contents {}", contents);  
          return Ok(contents);   
        }
        None => {
          println!("Impossible to get your home dir!");
          let contents: String = "".to_string();
          return Ok(contents);
        }
      }      

    }
    None => println!("Impossible to get your home dir!"),
  }
  return Ok("".to_string());
}

#[tauri::command]
fn set_engine_config(newConfig: String) -> Result<String, String> {
  match env::home_dir() {
    Some(path) => {
      let configPath: String = "\\Documents\\My Games\\Rising Storm 2\\ROGame\\Config\\ROEngine.ini".to_owned();
      let configPathFull: String;

      match path.to_str() {
        Some(pathAsStrRef) => {
          println!("Home path {}", pathAsStrRef.to_string());
          configPathFull = pathAsStrRef.to_owned() + &configPath;
          println!("configPathFull {}", configPathFull);

          fs::write(configPathFull, newConfig).expect("Something went wrong writing config file");
          // println!("newConfig {}", newConfig); 
          return Ok("Success".into());
        }
        None => {
          return Err("Impossible to get your home dir!".into())
        }
      }
    }
    None => Err("Impossible to get your home dir!".into())
  }
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
    .invoke_handler(tauri::generate_handler![get_engine_config, set_engine_config])
    .run(context)
    .expect("error while running tauri application");
}
