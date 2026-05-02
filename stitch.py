import cv2
import sys
import os

images = [
    r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\tvrtkoleft.jpg",
    r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\tvrtkocentar.jpg",
    r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\tvrtkoRight.jpg",
    r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\tvrtop1.jpg",
    # r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\tvrtop2.jpg"
]

loaded_images = []
for img_path in images:
    if os.path.exists(img_path):
        img = cv2.imread(img_path)
        if img is not None:
            loaded_images.append(img)
            print(f"Loaded: {os.path.basename(img_path)}")
        else:
            print(f"Could not read: {img_path}")
    else:
        print(f"File not found: {img_path}")

print(f"Stitching {len(loaded_images)} images...")

# mode = cv2.Stitcher_PANORAMA by default, which works well for standard horizontal pans.
stitcher = cv2.Stitcher_create(cv2.Stitcher_SCANS) # SCANS is sometimes better for non-tripod or slightly unordered arrays
# But let's try standard PANORAMA first
stitcher_pano = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)

status, stitched = stitcher_pano.stitch(loaded_images)

if status == cv2.Stitcher_OK:
    out_path = r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\KingTvrtkoPanorama.jpg"
    cv2.imwrite(out_path, stitched)
    print(f"Success! Saved panorama to {out_path}")
else:
    print(f"Panorama stitch failed with error code: {status}")
    print("Code 1: ERR_NEED_MORE_IMGS")
    print("Code 2: ERR_HOMOGRAPHY_EST_FAIL")
    print("Code 3: ERR_CAMERA_PARAMS_ADJUST_FAIL")
    
    # Try SCANS mode if PANORAMA fails
    print("Trying SCANS mode...")
    stitcher_scans = cv2.Stitcher_create(cv2.Stitcher_SCANS)
    status2, stitched2 = stitcher_scans.stitch(loaded_images)
    if status2 == cv2.Stitcher_OK:
        out_path = r"d:\TuzlaTourApp\public\assets\Gallery\QuestQRLocations\Tvrko pannellum\KingTvrtkoPanorama.jpg"
        cv2.imwrite(out_path, stitched2)
        print(f"Success with SCANS! Saved panorama to {out_path}")
    else:
        print(f"SCANS stitch also failed with error code: {status2}")
