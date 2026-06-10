import os

files = {
    "src/components/workspaces/TechnologistWorkspace.tsx": [
        ("api.get('recipes/')", "api.get('production/recipes/')"),
        ("api.post('recipes/',", "api.post('production/recipes/',")
    ],
    "src/components/workspaces/MaintenanceWorkspace.tsx": [
        ("api.get('telemetry/alarms/active/')", "api.get('alerts/')"),
        ("api.get('maintenance/tickets/')", "api.get('support-tickets/')"),
        ("api.post('maintenance/tickets/',", "api.post('support-tickets/',"),
        ("api.patch(`maintenance/tickets/${ticketId}/`,", "api.patch(`support-tickets/${ticketId}/`,")
    ]
}

for file, replacements in files.items():
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    for old, new in replacements:
        content = content.replace(old, new)
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("API URLs updated!")
