# RETROPLAY Installation Guide

## Prerequisites

- Python 3.10 or higher
- pip (Python package manager)
- Audio output device

## Step-by-Step Installation

### 1. Clone or Download RETROPLAY

```bash
cd RETROPLAY
```

### 2. Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Verify Installation

Check that all packages are installed:
```bash
pip list
```

You should see:
- pygame
- pillow
- bcrypt
- mutagen
- numpy

### 5. Run RETROPLAY

```bash
python main.py
```

## First Time Setup

1. **Create Account**: On first launch, press F1 to switch to Register mode
2. **Enter Details**: 
   - Username (unique)
   - Email address
   - Password (will be securely hashed)
3. **Login**: After registration, switch back to Login mode (F1) and enter credentials

## Troubleshooting

### Audio Issues

If you encounter audio problems:
- Ensure your audio device is properly connected
- Check system volume settings
- Try reinstalling pygame: `pip uninstall pygame && pip install pygame`

### Database Errors

If database errors occur:
- Delete `database/retroplay.db` to reset
- Restart the application

### Import Errors

If you get module import errors:
- Ensure you're in the RETROPLAY directory
- Verify virtual environment is activated
- Reinstall requirements: `pip install -r requirements.txt --force-reinstall`

### Performance Issues

For better performance:
- Close other resource-intensive applications
- Reduce particle effects in settings
- Lower visualizer complexity

## Supported Audio Formats

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- FLAC (.flac)
- M4A (.m4a)

## System Requirements

**Minimum:**
- CPU: Dual-core 2.0 GHz
- RAM: 2 GB
- Storage: 100 MB
- Display: 1280x720

**Recommended:**
- CPU: Quad-core 2.5 GHz+
- RAM: 4 GB+
- Storage: 500 MB+
- Display: 1920x1080

## Getting Help

If you encounter issues:
1. Check this installation guide
2. Review the README.md
3. Check the RETROPLAY_SPEC.md for detailed feature information
