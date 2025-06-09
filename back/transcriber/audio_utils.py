import ffmpeg
import os

def extract_audio(input_path: str, output_path: str = "temp_audio.wav"):
    (
        ffmpeg
        .input(input_path)
        .output(output_path, ac=1, ar='16000')
        .overwrite_output()
        .run(capture_stdout=True, capture_stderr=True)
    )
    return output_path