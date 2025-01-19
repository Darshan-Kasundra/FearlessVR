import speech_recognition as sr

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    
    # Open the audio file
    with sr.AudioFile(file_path) as source:
        # Adjust for ambient noise and listen to the file
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.record(source)
    
    try:
        # Recognize speech using Google's speech recognition
        transcription = recognizer.recognize_google(audio)
        return transcription
    except sr.UnknownValueError:
        return "Google Speech Recognition could not understand the audio."
    except sr.RequestError:
        return "Could not request results from Google Speech Recognition service."

# Test with an audio file
audio_file = "music.wav"
print(transcribe_audio(audio_file))
