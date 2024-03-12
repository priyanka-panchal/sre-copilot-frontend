
import './App.css';
import Routess from './routes/Routes.js';
import { Provider } from 'react-redux';
import { store } from './store/store';

function App() {
  return (
    <Provider store={store}>
    <div className="App">
    <Routess />
  </div>
  </Provider>
  );
}

export default App;
