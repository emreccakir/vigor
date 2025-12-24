import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, Keyboard, TouchableWithoutFeedback, Alert 
} from 'react-native';

export default function App() {
  // Hafıza (State) Yönetimi: Kullanıcı verilerini burada saklıyoruz
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);

  // Kalori Hesaplama Fonksiyonu (Mifflin-St Jeor Formülü)
  const calculateCalories = () => {
    if (!age || !height || !weight) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun!");
      return;
    }

    // Basit bir hesaplama (Erkekler için genel formül kullanıldı)
    // 10*kilo + 6.25*boy - 5*yaş + 5
    const bmr = (10 * parseFloat(weight)) + (6.25 * parseFloat(height)) - (5 * parseFloat(age)) + 5;
    setResult(Math.round(bmr));
    Keyboard.dismiss(); // Klavyeyi kapat
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        
        {/* Başlık Alanı */}
        <View style={styles.header}>
          <Text style={styles.brandName}>Vigor</Text>
          <Text style={styles.tagline}>Kalori Takip & Sağlık</Text>
        </View>

        {/* Giriş Alanları */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Yaşınız</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: 25" 
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <Text style={styles.label}>Boyunuz (cm)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: 180" 
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />

          <Text style={styles.label}>Kilonuz (kg)</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Örn: 80" 
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />

          <TouchableOpacity style={styles.button} onPress={calculateCalories}>
            <Text style={styles.buttonText}>Hesapla</Text>
          </TouchableOpacity>
        </View>

        {/* Sonuç Alanı */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Günlük İhtiyacınız:</Text>
            <Text style={styles.resultValue}>{result} kcal</Text>
          </View>
        )}

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 20,
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
    marginBottom: 40,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2D3436',
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 14,
    color: '#00B894',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#636E72',
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F1F2F6',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#00B894',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultCard: {
    marginTop: 30,
    backgroundColor: '#2D3436',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  resultTitle: {
    color: '#BDC3C7',
    fontSize: 16,
  },
  resultValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  }
});
