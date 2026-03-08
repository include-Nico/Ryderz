import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
// @ts-ignore (se non hai ancora i tipi per il tuo file JS)
import { Game } from '../js/main.js'; 

export default function App() {
  useEffect(() => {
    // Questo gira solo sul Browser
    if (typeof window !== 'undefined') {
      const game = new Game('gameCanvas');
      game.start();
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Il Canvas HTML standard per il gioco */}
      <canvas 
        id="gameCanvas" 
        style={{ width: '100%', height: '100%', backgroundColor: '#222' }} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});