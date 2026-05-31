# Beauty Feature Research for Video Editor

Date: 2026-05-31

## Sources Checked

- CapCut Face Retouch: https://www.capcut.com/tools/face-retouching
- YouCam Video: https://www.youcammakeup.com/consumer/apps/ycv
- Meitu App Store: https://apps.apple.com/us/app/meitu-ai-photo-video-editor/id416048305
- Wink Google Play: https://play.google.com/store/apps/details?hl=en-US&id=com.meitu.wink
- Facetune Video Editing Tools: https://www.facetuneapp.com/products/video-editor/video-editing-tools
- TikTok Effect House Face Retouch: https://effecthouse.tiktok.com/learn/guides/workspace/objects/face-effects/face-retouch
- Perfect365 Video Makeup Editor: https://apps.apple.com/us/app/perfect365-video-makeup-editor/id1591342284
- VN Video Editor App Store: https://apps.apple.com/us/app/vn-video-editor/id1343581380
- Final Cut Pro: https://www.apple.com/final-cut-pro/
- MediaPipe Face Landmarker: https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker

## Competitive Pattern

There are two product families:

1. Timeline-first editors: CapCut, VN, Final Cut Pro, Premiere Pro.
   - Strong at trimming, multi-track editing, keyframes, text, audio, captions, effects, export.
   - Beauty features are often one tool among many.

2. Beauty-first editors: YouCam Video, Meitu, Wink, Facetune, Perfect365.
   - Strong at face retouch, makeup, skin, face reshape, body reshape, hair color, teeth whitening.
   - Editing tools are often optimized for short social video.

The opportunity is to combine a real timeline editor with beauty-first workflows.

## Beauty Feature Inventory

| Feature | Seen In | Notes |
|---|---|---|
| One-tap beauty | Meitu, YouCam, Wink | Good entry point for casual users. |
| Skin smoothing | CapCut, YouCam, Meitu, Wink, Perfect365, TikTok Effect House | Must preserve edges and skin texture to avoid plastic look. |
| Skin brightening / tone | CapCut, YouCam, TikTok Effect House | Useful as a subtle correction slider. |
| Blemish removal | Meitu | Harder in video because temporal consistency matters. |
| Dark circle reduction | CapCut, TikTok Effect House | High-value portrait feature. |
| Smile line / wrinkle softening | CapCut, TikTok Effect House, Meitu VIP | Needs subtle defaults. |
| Teeth whitening | YouCam, Meitu, Wink, Perfect365, TikTok Effect House | Good MVP candidate. |
| Eye brightening / eye brilliance | Meitu, TikTok Effect House | Good MVP candidate if face landmarks are stable. |
| Face reshape | YouCam, Meitu, Wink, Facetune | Powerful but more sensitive ethically and technically. |
| Body reshape | Meitu, Wink | Should be v2, not MVP. |
| Makeup presets | YouCam, Meitu, Perfect365, Facetune | Strong differentiator: lipstick, blush, eyelashes, eyeshadow. |
| Hair color | YouCam, Perfect365, Meitu | V2 feature due segmentation quality requirements. |
| Video enhancer / unblur / 4K upscale | YouCam, Meitu, Wink, InShot | Valuable but can be compute-heavy. |
| Background cutout / remover | VN, Meitu, Wink, CapCut | Useful, but separate from beauty. |
| Face swap | YouCam | Not recommended for MVP due trust/safety risk. |
| Before/after playback | Perfect365 | Very useful for beauty edits. |
| Multi-face selection | TikTok Effect House | Important for group videos. |

## Recommended MVP Beauty Set

1. Beauty preset slider
   - Values: Off, Natural, Soft, Glam
   - Internally maps to individual sliders.

2. Face retouch sliders
   - Skin Smooth
   - Skin Brighten
   - Dark Circles
   - Smile Lines
   - Teeth White
   - Eye Bright

3. Lightweight makeup
   - Lip color
   - Blush
   - Eyelash/eye emphasis
   - 6-12 presets

4. Timeline integration
   - Apply to selected clip
   - Apply to all clips
   - Strength keyframes
   - Before/after toggle
   - Per-face selection when multiple faces exist

5. Export behavior
   - Beauty effects are non-destructive project effects.
   - Original media is never overwritten.

## V2 Candidates

- Face reshape: face width, jawline, nose, lips.
- Body reshape.
- Hair color.
- AI video enhancer / unblur / 4K upscale.
- Background cutout and object removal.
- Beauty templates shared across projects.
- Cloud-rendered high-quality beauty pass.

## Avoid or Treat Carefully

- Face swap / deepfake-like features.
- Aggressive default reshaping.
- Hidden automatic beauty filters.
- Beauty claims like "perfect" or "fix yourself".
- Uploading face videos to cloud without clear consent.

## Technical Notes

For Win / Mac / iPhone, beauty effects should be an engine-level effect, not hardcoded into the UI. A project effect can look like:

```json
{
  "type": "beauty.retouch.v1",
  "target": "selected_faces",
  "preset": "natural",
  "params": {
    "skinSmooth": 0.35,
    "skinBrighten": 0.2,
    "darkCircles": 0.25,
    "smileLines": 0.15,
    "teethWhite": 0.2,
    "eyeBright": 0.2
  },
  "keyframes": []
}
```

Implementation needs:

- Face detection and landmarks.
- Temporal smoothing to prevent flicker.
- Region masks for skin, eyes, teeth, lips.
- GPU shader path for real-time preview.
- Higher-quality offline export path.

MediaPipe Face Landmarker is a strong candidate for prototyping because it outputs 3D face landmarks, blendshape scores, and transformation matrices useful for effects rendering.

