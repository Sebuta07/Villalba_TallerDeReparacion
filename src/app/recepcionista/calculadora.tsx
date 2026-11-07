import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CalculadoraScreen() {
  const [displayValue, setDisplayValue] = useState('0');
  const [equation, setEquation] = useState('');
  const [esperandoSegundoOperando, setEsperandoSegundoOperando] = useState(false);

  const ingresarDigito = (digito: string) => {
    if (esperandoSegundoOperando) {
      setDisplayValue(digito);
      setEsperandoSegundoOperando(false);
    } else {
      setDisplayValue(displayValue === '0' ? digito : displayValue + digito);
    }
  };

  const ingresarPunto = () => {
    if (esperandoSegundoOperando) {
      setDisplayValue('0.');
      setEsperandoSegundoOperando(false);
      return;
    }
    if (!displayValue.includes('.')) {
      setDisplayValue(displayValue + '.');
    }
  };

  const limpiar = () => {
    setDisplayValue('0');
    setEquation('');
    setEsperandoSegundoOperando(false);
  };

  const borrarUltimo = () => {
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue('0');
    }
  };

  const manejarOperacion = (siguienteOperador: string) => {
    const valorActual = parseFloat(displayValue);

    if (equation && esperandoSegundoOperando) {
      setEquation(equation.slice(0, -2) + ` ${siguienteOperador} `);
      return;
    }

    if (equation === '') {
      setEquation(`${displayValue} ${siguienteOperador} `);
    } else {
      const partes = equation.split(' ');
      const operadorAnterior = partes[1];
      const primerValor = parseFloat(partes[0]);
      
      const resultado = calcular(primerValor, valorActual, operadorAnterior);
      setEquation(`${resultado} ${siguienteOperador} `);
      setDisplayValue(String(resultado));
    }

    setEsperandoSegundoOperando(true);
  };

  const calcular = (primerValor: number, segundoValor: number, operador: string) => {
    switch (operador) {
      case '+': return primerValor + segundoValor;
      case '-': return primerValor - segundoValor;
      case '×': return primerValor * segundoValor;
      case '÷': return segundoValor !== 0 ? primerValor / segundoValor : 0;
      default: return segundoValor;
    }
  };

  const manejarIgual = () => {
    if (!equation) return;

    const partes = equation.split(' ');
    const operador = partes[1];
    const primerValor = parseFloat(partes[0]);
    const segundoValor = parseFloat(displayValue);

    const resultado = calcular(primerValor, segundoValor, operador);
    setDisplayValue(String(resultado));
    setEquation('');
    setEsperandoSegundoOperando(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calculadora Rápida</Text>
      </View>

      <View style={styles.displayContainer}>
        <Text style={styles.equationText}>{equation}</Text>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {displayValue}
        </Text>
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.btnAccion]} onPress={limpiar}>
            <Text style={[styles.buttonText, styles.textAccion]}>C</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnAccion]} onPress={borrarUltimo}>
            <Ionicons name="backspace-outline" size={20} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnAccion]} onPress={() => manejarOperacion('÷')}>
            <Text style={[styles.buttonText, styles.textOperador]}>÷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnAccion]} onPress={() => manejarOperacion('×')}>
            <Text style={[styles.buttonText, styles.textOperador]}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('7')}>
            <Text style={styles.buttonText}>7</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('8')}>
            <Text style={styles.buttonText}>8</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('9')}>
            <Text style={styles.buttonText}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnAccion]} onPress={() => manejarOperacion('-')}>
            <Text style={[styles.buttonText, styles.textOperador]}>-</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('4')}>
            <Text style={styles.buttonText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('5')}>
            <Text style={styles.buttonText}>5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('6')}>
            <Text style={styles.buttonText}>6</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.btnAccion]} onPress={() => manejarOperacion('+')}>
            <Text style={[styles.buttonText, styles.textOperador]}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.leftColumn}>
            <View style={styles.row}>
              <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('1')}>
                <Text style={styles.buttonText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('2')}>
                <Text style={styles.buttonText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => ingresarDigito('3')}>
                <Text style={styles.buttonText}>3</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={[styles.button, styles.buttonZero]} onPress={() => ingresarDigito('0')}>
                <Text style={styles.buttonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={ingresarPunto}>
                <Text style={styles.buttonText}>.</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.button, styles.btnIgual]} onPress={manejarIgual}>
            <Text style={[styles.buttonText, { color: '#fff' }]}>=</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16, justifyContent: 'space-between' },
  header: { marginTop: 10, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  
  displayContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, alignItems: 'flex-end', justifyContent: 'center', minHeight: 110, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10, shadowColor: '#0F172A', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  equationText: { color: '#64748B', fontSize: 14, marginBottom: 4, height: 20 },
  displayText: { color: '#0F172A', fontSize: 38, fontWeight: 'bold' },

  keypad: { gap: 8, marginBottom: 15 },
  row: { flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  leftColumn: { flex: 3, gap: 8 },
  
  button: { flex: 1, backgroundColor: '#FFFFFF', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  buttonZero: { flex: 2, aspectRatio: undefined },
  buttonText: { color: '#0F172A', fontSize: 22, fontWeight: '600' },

  btnAccion: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
  textAccion: { color: '#2563EB' },
  textOperador: { color: '#2563EB', fontSize: 24 },

  btnIgual: { flex: 1, backgroundColor: '#2563EB', borderColor: '#2563EB', aspectRatio: undefined, height: undefined }
});