import speech_recognition as sr
#from speech_to_text import transcribe_audio
#import openai

# OpenAI API Key


import pyttsx3

def text_to_speech(questions):
    """
    Convert a list of questions into speech and play them aloud.

    Args:
        questions (list): A list of questions to be read aloud.
    """
    # Initialize the pyttsx3 engine
    engine = pyttsx3.init()
    
    # Iterate over each question and use the engine to say it aloud
    for question in questions:
        print(f"Speaking question: {question}")
        engine.say(question)  # Convert the question text to speech
    
    # Wait for the speech to finish before closing the engine
    engine.runAndWait()

transcription = ""

# Question Generation Function

# def generate_questions_from_text(transcription, num_questions=3):
#     prompt = (
#         f"The following is a transcript of a speech:\n\n"
#         f"{transcription}\n\n"
#         f"Generate {num_questions} questions that could be asked during a Q&A session based on this speech:"
#     )
#     try:
#         response = openai.chat.completions.create(
#             model="gpt-3.5-turbo",  # or "gpt-4" if you have access
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant for generating questions."},
#                 {"role": "user", "content": prompt},
#             ],
#             max_tokens=150,
#             temperature=0.7,
#         )
#         questions = response.choices[0].message["content"].strip().split("\n")
#         return [q.strip() for q in questions if q.strip()]
#     except Exception as e:
#         print(f"Error generating questions: {e}")
#         return []

import google.generativeai as genai

# Configure the Gemini API with your API key
genai.configure()

def generate_questions_from_text(transcription, num_questions=3):
    transcription = "Hockey is more than just a sport; it’s a celebration of speed, skill, and teamwork. Known as one of the fastest games on ice, hockey has captured the hearts of millions around the world. From its humble beginnings in Canada in the 19th century to becoming a global phenomenon, hockey symbolizes passion and resilience."
    """
    Generates questions from the provided text using Google's Gemini API.

    Args:
        transcription (str): The text transcription of the speech.
        num_questions (int): Number of questions to generate.

    Returns:
        list: A list of generated questions.
    """
    prompt = (
        f"The following is a transcript of a speech:\n\n"
        f"{transcription}\n\n"
        f"Generate {num_questions} questions that could be asked during a Q&A session based on this speech:"
    )
    try:
        # Use Gemini to generate content
        model = genai.GenerativeModel("gemini-1.5-flash")  # Ensure the correct model version is used
        response = model.generate_content(prompt)
        
        # Extract the response text and split into questions
        generated_text = response.text.strip()
        questions = generated_text.split("\n")
        return [q.strip() for q in questions if q.strip()]
    except Exception as e:
        print(f"Error generating questions: {e}")
        return []






def transcribe_from_mic():
    recognizer = sr.Recognizer()
    
    with sr.Microphone() as source:
        print("Please say something...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)
    
    try:
        # Recognize speech using Google's speech recognition
        transcription = recognizer.recognize_google(audio)
        print("You said:", transcription)
    except sr.UnknownValueError:
        print("Google Speech Recognition could not understand the audio.")
    except sr.RequestError:
        print("Could not request results from Google Speech Recognition service.")

# Test with the microphone
#transcribe_from_mic()


# Main Workflow
if __name__ == "__main__":
    audio_file = "sample_audio.mp3"
    #transcription = transcribe_audio(audio_file)

    #if transcribed_text:
        #print(f"Transcribed Text: {transcription}")
    questions = generate_questions_from_text(transcription, num_questions=5)
    print("Generated Questions:")
    for i, question in enumerate(questions, 1):
            print(f"{question}")
    #else:
        #print("Transcription failed.")


# Convert the generated questions to speech
text_to_speech(questions)


