package ApplicationLayer;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Arrays;
import java.util.List;

import ModelLayer.RandomForest;
import DataLayer.DataSet;

public class RetentionStrategies {

    private static RandomForest forest;

    public static void main(String[] args) {
        // Initialize the GUI
        JFrame frame = new JFrame("Churn Prediction System");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 500);

        // Create the main container panel and set layout
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BorderLayout());

        // Create the input panel and set a GridBagLayout for organized input fields
        JPanel inputPanel = new JPanel();
        inputPanel.setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;

        // Labels and text fields for user input
        String[] featureLabels = {
            "Gender (male or female)", "Senior Citizen (yes or no)", "Partner (yes or no)", "Dependents (yes or no)",
            "Tenure", "Phone Service (yes or no)", "Multiple Lines (yes or no)", "Online Security (yes or no)",
            "Online Backup (yes or no)", "Device Protection (yes or no)", "Tech Support (yes or no)", 
            "Streaming TV (yes or no)", "Streaming Movies (yes or no)", "Paperless Billing (yes or no)", 
            "Monthly Charges", "Total Charges"
        };
        JTextField[] inputFields = new JTextField[16];

        for (int i = 0; i < 16; i++) {
            gbc.gridx = 0;
            gbc.gridy = i;
            inputPanel.add(new JLabel(featureLabels[i]), gbc);

            inputFields[i] = new JTextField(10);
            gbc.gridx = 1;
            inputPanel.add(inputFields[i], gbc);
        }

        // Button for making predictions
        JButton predictButton = new JButton("Predict Churn");
        gbc.gridx = 0;
        gbc.gridy = 16;
        gbc.gridwidth = 2;
        inputPanel.add(predictButton, gbc);

        // Result label
        JLabel resultLabel = new JLabel("Prediction: ");
        JLabel accuracyLabel = new JLabel("Accuracy: ");
        gbc.gridx = 0;
        gbc.gridy = 17;
        gbc.gridwidth = 1;
        inputPanel.add(resultLabel, gbc);
        gbc.gridx = 1;
        inputPanel.add(accuracyLabel, gbc);

       
        mainPanel.add(inputPanel, BorderLayout.CENTER);

        frame.add(mainPanel);

        // Load training and testing datasets
        DataSet trainingDataSet = new DataSet("C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\train_data.csv");
        DataSet testingDataSet = new DataSet("C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\test_data.csv");

        // Extract data from the DataSet objects
        double[][] X_train = convertToDoubleArray(trainingDataSet.getData());
        int[] y_train = extractLabels(trainingDataSet.getData());
        double[][] X_test = convertToDoubleArray(testingDataSet.getData());
        int[] y_test = extractLabels(testingDataSet.getData());

        // Train the RandomForest model on the entire training data
        forest = new RandomForest(10, 5, 2, 2);
        forest.fit(X_train, y_train);

        // Evaluate the model on the testing data
        int[] predictions = forest.predict(X_test);
        double accuracy = calculateAccuracy(y_test, predictions);
        accuracyLabel.setText("Accuracy: " + String.format("%.2f%%", accuracy * 100));

        // Action listener for the predict button
        predictButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    
                    double[] newCustomerData = new double[19];
                    for (int i = 0; i < 16; i++) {
                        String input = inputFields[i].getText().toLowerCase().trim();
                        switch (i) {
                            case 0:  // Gender
                                newCustomerData[i] = input.equals("male") ? 1 : 0;
                                break;
                            case 1:  // Senior Citizen
                            case 2:  // Partner
                            case 3:  // Dependents
                            case 5:  // Phone Service
                            case 6:  // Multiple Lines
                            case 7:  // Online Security
                            case 8:  // Online Backup
                            case 9:  // Device Protection
                            case 10: // Tech Support
                            case 11: // Streaming TV
                            case 12: // Streaming Movies
                            case 13: // Paperless Billing
                                newCustomerData[i] = input.equals("yes") ? 1 : 0;
                                break;
                            case 4:  // Tenure
                            case 14: // Monthly Charges
                            case 15: // Total Charges
                                newCustomerData[i] = Double.parseDouble(input);
                                break;
                        }
                    }

                    // Make a prediction on the new customer data
                 // Make a prediction on the new customer data
                    int[] newPredictions = forest.predict(new double[][]{newCustomerData});
                    resultLabel.setText("Prediction: " + Arrays.toString(newPredictions));
                    // Assuming retentionPlans needs these parameters correctly indexed:
                    retentionPlans(newPredictions[0], 
                                   newCustomerData[1],  // isSenior
                                   newCustomerData[7],  // usesOnlineServices
                                   newCustomerData[13], // paperlessBilling
                                   newCustomerData[16], // techSupportCalls (assumed index)
                                   newCustomerData[17], // paymentStruggles (assumed index)
                                   newCustomerData[15], // totalCharges (reassigned from earlier assumption)
                                   newCustomerData[4],  // tenure
                                   newCustomerData[14]  // internetServiceUsage
                                   );

                } catch (NumberFormatException ex) {
                    JOptionPane.showMessageDialog(frame, "Please enter valid numeric values for numerical fields.");
                }
            }
        });

        frame.setVisible(true);
    }

    // Retention Plans Function after making external analysis on the most reasons that makes the customers leaves
    private static void retentionPlans(int churnPrediction, double isSenior, double usesOnlineServices,
            double paperlessBilling, double techSupportCalls, double paymentStruggles,
            double totalCharges, double tenure, double internetServiceUsage) {
    	if (churnPrediction == 1) { // Check if the customer is predicted to churn
    		if (isSenior == 1 && usesOnlineServices == 0) { // Senior citizen not using online services
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nOffer cheaper plan with less internet charges.");
    		} else if (paperlessBilling == 1 && techSupportCalls > 1) { // Customer uses paperless billing, has made many tech support calls, and struggles with payments
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nImprove customer support and offer assistance with payment services.");
    		} else if (totalCharges > 1870) { // Customer total charges are high and they have churned
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nThey are struggling to pay the money they owe: offer them a payment plan.");
    		} else if (tenure < 17) { // Customer tenure is less than 17 months and they have churned
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nSome customers are not satisfied with the services. You have to update the internet service.");
    		} else if (internetServiceUsage == 0) { // Customer does not use internet services and has churned
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nOffer a different plan with less internet charges.");
    		} else if (techSupportCalls > 1 && paperlessBilling == 0 && totalCharges <= 1870) { // High tech support calls with no other significant issues
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nThe customer complains to support a lot. Provide them a survey to see what their issue is.");
    		} else {
    			JOptionPane.showMessageDialog(null, "At Risk Customer \nCustomer have too many charges and not using all the servcies give them better plan before they leave.");
    		}
    	}
    }


    private static double[][] convertToDoubleArray(List<List<String>> data) {
        double[][] result = new double[data.size()][data.get(0).size() - 1];
        for (int i = 0; i < data.size(); i++) {
            for (int j = 0; j < data.get(i).size() - 1; j++) {
                result[i][j] = Double.parseDouble(data.get(i).get(j));
            }
        }
        return result;
    }

    private static int[] extractLabels(List<List<String>> data) {
        int[] labels = new int[data.size()];
        for (int i = 0; i < data.size(); i++) {
            labels[i] = Integer.parseInt(data.get(i).get(data.get(i).size() - 1));
        }
        return labels;
    }

    private static double calculateAccuracy(int[] actualLabels, int[] predictedLabels) {
        int correctCount = 0;
        for (int i = 0; i < actualLabels.length; i++) {
            if (actualLabels[i] == predictedLabels[i]) {
                correctCount++;
            }
        }
        return (double) correctCount / actualLabels.length;
    }
}
