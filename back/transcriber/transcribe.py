from faster_whisper import WhisperModel

# Load model once (outside your endpoint)
model = WhisperModel("base", compute_type="int8")  # or "medium", "large-v2"

def transcribe_audio(audio_path: str) -> str:
    segments, _ = model.transcribe(audio_path, beam_size=5)
    transcription = " ".join(segment.text for segment in segments)
    return transcription