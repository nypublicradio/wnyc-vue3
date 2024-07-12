import { NativeAudio } from 'native-audio';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    NativeAudio.echo({ value: inputValue })
}
