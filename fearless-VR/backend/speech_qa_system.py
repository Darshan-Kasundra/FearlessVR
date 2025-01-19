import speech_recognition as sr
import pyttsx3
import google.generativeai as genai

# Configure the Gemini API with your API key
genai.configure()
transcription = ""

def text_to_speech(question):
    """
    Convert a single question into speech and play it aloud.

    Args:
        question (str): The question to be read aloud.
    """
    # Initialize the pyttsx3 engine
    engine = pyttsx3.init()

    print(f"Speaking question: {question}")
    engine.say(question)  # Convert the question text to speech

    # Wait for the speech to finish before closing the engine
    engine.runAndWait()

def generate_question_from_text(transcription):
    """
    Generates a single question from the provided text using Google's Gemini API.

    Args:
        transcription (str): The text transcription of the speech.

    Returns:
        str: The generated question.
    """
    transcription = "Hockey is more than just a sport; its a celebration of speed, skill, and teamwork. Known as one of the fastest games on ice, hockey has captured the hearts of millions around the world. From its humble beginnings in Canada in the 19th century to becoming a global phenomenon, hockey symbolizes passion and resilience."
    
    prompt = (
        f"The following is a transcript of a speech:\n\n"
        f"{transcription}\n\n"
        f"Generate one question that could be asked during a Q&A session based on this speech:"
    )
    try:
        # Use Gemini to generate content
        model = genai.GenerativeModel("gemini-1.5-flash")  # Ensure the correct model version is used
        response = model.generate_content(prompt)

        # Extract the response text
        question = response.text.strip()
        return question
    except Exception as e:
        print(f"Error generating question: {e}")
        return "Error: Could not generate a question."

def transcribe_from_mic():
    """
    Transcribes speech from the microphone.

    Returns:
        str: The transcribed text.
    """
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        print("Please say something...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        # Recognize speech using Google's speech recognition
        transcription = recognizer.recognize_google(audio)
        print("You said:", transcription)
        return transcription
    except sr.UnknownValueError:
        print("Google Speech Recognition could not understand the audio.")
        return ""
    except sr.RequestError:
        print("Could not request results from Google Speech Recognition service.")
        return ""

# Main Workflow
if __name__ == "__main__":
    # Transcribe audio from the microphone (optional)
    #transcription = transcribe_from_mic()

    # Generate a single question from the transcription
    question = generate_question_from_text(transcription)
    print("Generated Question:", question)

    # Convert the generated question to speech
    text_to_speech(question)
