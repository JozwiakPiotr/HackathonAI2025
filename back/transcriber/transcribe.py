from faster_whisper import WhisperModel
from tqdm import tqdm

model = WhisperModel("base", compute_type="int8", device="cpu")  # or "medium", "large-v2"

def transcribe_audio(audio_path: str) -> str:
    segments_generator, _ = model.transcribe(audio_path, beam_size=5)
    
    transcription_parts = []
    for segment in tqdm(segments_generator, desc="Transcribing"):
        transcription_parts.append(segment.text)
    
    return " ".join(transcription_parts)