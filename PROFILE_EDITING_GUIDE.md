# Profile Editing - Complete Guide 🎭

## Overview
RETROPLAY now has a fully functional profile editing system with a beautiful UI and complete backend integration.

## Features Implemented

### ✅ Profile Tab
- **Beautiful profile display** with avatar, stats, and info
- **Real-time statistics** showing songs, playlists, and plays
- **Bio section** with your personal description
- **Favorite genres** displayed as tags
- **Public/Private badge** showing profile visibility
- **Recent activity** section (ready for future expansion)

### ✅ Profile Modal Editor
- **Profile picture upload** with live preview
- **Bio editing** (max 500 characters)
- **Favorite genres** (comma-separated)
- **Privacy toggle** (public/private profile)
- **Statistics display** in modal
- **Validation** for all inputs

### ✅ Backend API
- `GET /api/profile` - Fetch user profile
- `PUT /api/profile` - Update profile with file upload
- `GET /api/profile/stats` - Get user statistics
- `DELETE /api/profile/picture` - Remove profile picture

### ✅ Database Integration
- All profile fields stored in users table
- Profile pictures saved to `uploads/profiles/`
- Automatic stats calculation
- Secure file handling

## How to Use

### View Your Profile
1. **Click "Profile" in sidebar** - Opens profile tab
2. **See your stats** - Songs, playlists, total plays
3. **View your info** - Bio, genres, badges
4. **Check activity** - Recent actions (coming soon)

### Edit Your Profile
1. **Click "Edit Profile" button** - Opens modal
2. **Change profile picture:**
   - Click "Change Photo"
   - Select image file
   - See live preview
3. **Update bio:**
   - Write about yourself (max 500 chars)
   - Describe your music taste
4. **Set favorite genres:**
   - Enter genres separated by commas
   - Example: "Rock, Jazz, Electronic"
5. **Toggle privacy:**
   - Check "Make profile public" for public profile
   - Uncheck for private
6. **Click "Save Changes"** - Updates instantly!

### Quick Access
- **Click user avatar in sidebar** - Opens profile modal
- **Profile nav button** - Opens profile tab
- **Settings → Account** - Also has profile info

## UI Features

### Profile Tab Display
```
┌─────────────────────────────────────┐
│  [Avatar]  Username                 │
│            email@example.com        │
│            [Public Profile Badge]   │
├─────────────────────────────────────┤
│  [Songs]  [Playlists]  [Plays]     │
├─────────────────────────────────────┤
│  About                              │
│  Your bio text here...              │
├─────────────────────────────────────┤
│  Favorite Genres                    │
│  [Rock] [Jazz] [Electronic]        │
├─────────────────────────────────────┤
│  Recent Activity                    │
│  (Coming soon)                      │
└─────────────────────────────────────┘
```

### Profile Modal
```
┌─────────────────────────────────────┐
│  Edit Your Profile              [×] │
├─────────────────────────────────────┤
│  [Avatar]     Username (readonly)   │
│  [Change]     Email (readonly)      │
│               Bio (editable)        │
│               Genres (editable)     │
│               ☑ Public profile      │
├─────────────────────────────────────┤
│  Stats: 10 Songs | 3 Playlists     │
├─────────────────────────────────────┤
│  [Cancel]  [Save Changes]          │
└─────────────────────────────────────┘
```

## Styling

### Custom CSS Classes
- `.profile-tab-container` - Main profile layout
- `.profile-header-card` - Avatar and header info
- `.profile-avatar-display` - Large avatar display
- `.profile-stats-grid` - Statistics cards
- `.profile-info-card` - Info sections
- `.profile-modal` - Edit modal styling
- `.genre-tag` - Genre badges
- `.stat-card` - Statistic displays

### Responsive Design
- **Desktop:** Full grid layout with multiple columns
- **Tablet:** Adjusted grid with 2 columns
- **Mobile:** Single column, stacked layout

## API Details

### GET /api/profile
**Response:**
```json
{
  "success": true,
  "profile": {
    "username": "user123",
    "email": "user@example.com",
    "bio": "Music lover",
    "favoriteGenres": "Rock, Jazz",
    "profilePicture": "/uploads/profiles/pic.jpg",
    "isPublic": true,
    "createdAt": "2024-01-01"
  }
}
```

### PUT /api/profile
**Request (FormData):**
- `bio` - User bio text
- `favoriteGenres` - Comma-separated genres
- `isPublic` - Boolean (true/false)
- `profilePicture` - Image file (optional)

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### GET /api/profile/stats
**Response:**
```json
{
  "success": true,
  "stats": {
    "totalSongs": 42,
    "totalPlaylists": 5,
    "totalPlays": 420
  }
}
```

## File Structure

### Frontend Files
```
static/
├── js/
│   ├── profile.js          # Profile modal & editing
│   └── app.js              # Profile tab loading
└── css/
    └── style.css           # Profile styling
```

### Backend Files
```
RETROPLAY/
├── app.py                  # Profile API endpoints
└── uploads/
    └── profiles/           # Profile pictures
```

### Database
```sql
users table:
- userId
- username
- email
- bio
- favoriteGenres
- profilePicture
- isPublic
- createdAt
```

## Features Ready for Expansion

### 🔜 Coming Soon
- **Activity tracking** - Log user actions
- **Social features** - Follow other users
- **Profile sharing** - Share profile links
- **Achievements** - Badges and milestones
- **Music stats** - Top artists, genres
- **Listening history** - Recent plays

### 🎯 Easy to Add
1. **Activity logging:**
   - Create `activities` table
   - Log play, upload, playlist actions
   - Display in Recent Activity section

2. **Social features:**
   - Create `followers` table
   - Add follow/unfollow endpoints
   - Show follower count in stats

3. **Advanced stats:**
   - Track play counts per song
   - Calculate top artists/genres
   - Show listening trends

## Testing

### Test Profile Editing
1. **Login to RETROPLAY**
2. **Click Profile tab**
3. **Click Edit Profile**
4. **Upload a picture** - Should preview
5. **Add bio** - Type some text
6. **Add genres** - "Rock, Pop, Jazz"
7. **Toggle public** - Check/uncheck
8. **Save** - Should show success
9. **Verify** - Check profile tab updated

### Test Profile Display
1. **Check avatar** - Shows in sidebar
2. **Check stats** - Numbers display
3. **Check bio** - Text appears
4. **Check genres** - Tags display
5. **Check badge** - Public badge if enabled

## Troubleshooting

### Profile picture not uploading?
- Check `uploads/profiles/` folder exists
- Verify file permissions
- Check file size (max 5MB recommended)
- Ensure image format (jpg, png, gif)

### Stats not updating?
- Check database connection
- Verify songs/playlists exist
- Refresh profile tab
- Check browser console for errors

### Modal not opening?
- Check JavaScript loaded
- Verify `showProfileModal()` function
- Check for console errors
- Ensure user is logged in

## Status: ✅ COMPLETE!

**All profile editing features are fully implemented and working!**

Run the app:
```bash
cd RETROPLAY
python app.py
```

Then navigate to Profile tab and start customizing! 🎨
