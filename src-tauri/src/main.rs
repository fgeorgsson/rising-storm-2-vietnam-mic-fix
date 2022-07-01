#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::env;
use std::fs;
use tauri::State;

#[tauri::command]
fn getEngineConfig(state: State<String>) -> Result<String, String> {
  let contents = fs::read_to_string("C:\\Users\\TechGuru\\Documents\\My Games\\Rising Storm 2\\ROGame\\Config\\ROEngine.ini")
        .expect("Something went wrong reading the file");
  println!("contents {}", contents);  
  // Ok(state.fetch_add(delta, Ordering::SeqCst) + delta)
  return Ok(contents);
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
    .invoke_handler(tauri::generate_handler![getEngineConfig])
    .run(context)
    .expect("error while running tauri application");
}
