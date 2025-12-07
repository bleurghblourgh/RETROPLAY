# Bug Fix - Duplicate Endpoint

## Issue
```
AssertionError: View function mapping is overwriting an existing endpoint function: delete_playlist
```

## Cause
Two functions with the same name `delete_playlist` were defined in `app.py`:
1. Line 246: Old endpoint at `/api/playlists/<int:playlistId>/delete`
2. Line 493: New endpoint at `/api/playlists/<int:playlistId>`

Flask doesn't allow duplicate function names for routes.

## Fix
Renamed the old function to `delete_playlist_old` to avoid conflict.

The new endpoint is the correct one to use:
- `DELETE /api/playlists/<int:playlistId>` - RESTful standard

## Status
✅ Fixed - App should now start without errors

## To Run
```bash
cd RETROPLAY
python main.py
```

The app will now start successfully!
