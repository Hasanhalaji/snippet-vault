#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use tauri::Manager;

// Get the path to snippets.json next to the .exe (or in app data)
fn snippets_path(app: &tauri::AppHandle) -> PathBuf {
    // In production: AppLocalData dir  (C:\Users\X\AppData\Local\SnippetVault)
    // In dev: same dir as executable
    app.path()
        .app_local_data_dir()
        .expect("Could not resolve app data dir")
        .join("snippets.json")
}

#[tauri::command]
fn load_snippets(app: tauri::AppHandle) -> Result<String, String> {
    let path = snippets_path(&app);

    if !path.exists() {
        // First run — return empty array
        return Ok("[]".to_string());
    }

    fs::read_to_string(&path).map_err(|e| format!("Failed to read snippets: {}", e))
}

#[tauri::command]
fn save_snippets(app: tauri::AppHandle, data: String) -> Result<(), String> {
    let path = snippets_path(&app);

    // Make sure parent directory exists
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    fs::write(&path, data).map_err(|e| format!("Failed to write snippets: {}", e))
}

#[tauri::command]
fn get_snippets_path(app: tauri::AppHandle) -> String {
    snippets_path(&app).to_string_lossy().to_string()
}

#[tauri::command]
fn export_snippets(app: tauri::AppHandle, path: String, data: String) -> Result<(), String> {
    let _ = app; // keep app handle for consistency
    fs::write(&path, data).map_err(|e| format!("Export failed: {}", e))
}

#[tauri::command]
fn import_snippets(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Import failed: {}", e))
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            load_snippets,
            save_snippets,
            get_snippets_path,
            export_snippets,
            import_snippets,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
