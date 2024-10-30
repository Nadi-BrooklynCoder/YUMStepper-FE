// ErrorBoundary.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state to display fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can log the error to an error reporting service here
        console.error("Error Boundary Caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.errorText}>Something went wrong.</Text>
                    <Text style={styles.errorMessage}>{this.state.error.toString()}</Text>
                </View>
            );
        }

        return this.props.children; 
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
    },
});

export default ErrorBoundary;
