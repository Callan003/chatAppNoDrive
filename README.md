## Inspiration

I was watching **Laura Tamas**'s presentation on **OradeaTechHub**, and I was amazed by how cool **TypingDna** is and how easy it is to use it. At the end of the presentation she mentioned the hackathon. This was when I decided to join but had no idea what kind of project I would do.
Later that night (3:00 am to be precise) I woke up dreaming about this chat app that detects if a user is driving the car.
I ended up staying awake until like 7:00 am thinking about it...

## What it does

1) It is a fully functional chat app that allows 2 or more users to chat using text messages, and send images using phone's camera.
2) Users can register, login, use forgot password function, change passwords, change nicknames
3) It detects if somebody is texting and driving
4) It notifies the other chat participants that the person is currently texting and driving
5) It allows the other chat participants to disable a person's chat if that person is texting and driving (NOT IMPLEMENTED YET)

## Youtube link
https://youtu.be/IjDpRo-QCVI

## How I built it

I started building my app in **Ionic Framework**, using **Firebase** for the chat messages part. Later on I implemented **TypingDna** and a **NodeJs** backend server.

## Challenges I ran into

Firebase connectivity problems, CORS Policy, TypingDna implementation (I had to do a workaround for the typingdna.js to work and I also tried implementing typingDnaClient in the front-end but I failed, so I moved it to a backend serve), some CSS glitches.
I also tried implementing a library that detects if a user is in vehicle or not with a confidence represented in percentage but I failed. Maybe in the near future I`ll do it :)

## Accomplishments that I'm proud of

I am proud that I managed to successfully build an **AWESOME** app, that I managed to create the APK and it actually worked, that I uploaded the NodeJs backend on a live server. The whole process of building this app was a really great experience!

## What I learned

I learned that ideas and implementation are different things. I learned a lot about how the communication between frontend and backend works. I also learned a lot about how Ionic Framework works.

## What's next for ChatApp
Implement the disable chat feature, implement a better library that detects if a user is in a vehicle or not, adjust the right settings for the typingDna to work better, optimizing api calls - maybe save/check only the first 2-3 typing patterns of every new conversation (the usual _"Hello"_ and _"How are you?"_ that we often repeat during every conversation).

Maybe turn this whole app into and extension for another existing chat messenger app like WhatsApp or Facebook Messenger.
