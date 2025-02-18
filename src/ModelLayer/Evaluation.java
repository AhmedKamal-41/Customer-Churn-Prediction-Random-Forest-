package ModelLayer;

import DataLayer.DataSet;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Evaluation {

    private static RandomForest forest;

    public static void main(String[] args) {
        // Load training and testing datasets
        DataSet trainingDataSet = new DataSet("C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\train_data.csv");
        DataSet testingDataSet = new DataSet("C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\test_data.csv");

        // Extract data from the DataSet objects
        double[][] X_train = convertToDoubleArray(trainingDataSet.getData());
        int[] y_train = extractLabels(trainingDataSet.getData());
        double[][] X_test = convertToDoubleArray(testingDataSet.getData());
        int[] y_test = extractLabels(testingDataSet.getData());

        // Perform 5-fold cross-validation on the training data
        crossValidation(X_train, y_train, 5);

        // Train the RandomForest model on the entire training data
        forest = new RandomForest(15, 10, 2, 2); // Adjust parameters as necessary
        forest.fit(X_train, y_train);

        // Evaluate the model on the testing data
        int[] predictions = forest.predict(X_test);
        double accuracy = calculateAccuracy(y_test, predictions);
        System.out.println("Final Test Accuracy: " + accuracy);
    }

    public static double crossValidation(double[][] X, int[] y, int k) {
        int n = X.length;
        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            indices.add(i);
        }
        Collections.shuffle(indices);

        double totalAccuracy = 0;
        for (int i = 0; i < k; i++) {
            int start = i * (n / k);
            int end = (i == k - 1) ? n : (start + (n / k));

            double[][] X_train = subset(X, indices, 0, start, end, n);
            double[][] X_valid = subset(X, indices, start, end);
            int[] y_train = subset(y, indices, 0, start, end, n);
            int[] y_valid = subset(y, indices, start, end);

            RandomForest tempForest = new RandomForest(10, 5, 2, 2);
            tempForest.fit(X_train, y_train);
            int[] valid_predictions = tempForest.predict(X_valid);

            totalAccuracy += calculateAccuracy(y_valid, valid_predictions);
        }
        return totalAccuracy / k;
    }

    //helper functions to load the data again from the file to be easy to use and execute
    //since final performance on the k-validation and evaluation will be done here we did the functions here
    //instead of having a loader class to handle the data loading
    private static double[][] subset(double[][] X, List<Integer> indices, int start1, int end1, int start2, int end2) {
        double[][] subset = new double[end1 - start1 + end2 - start2][X[0].length];
        int idx = 0;
        for (int i = start1; i < end1; i++, idx++) {
            subset[idx] = X[indices.get(i)];
        }
        for (int i = start2; i < end2; i++, idx++) {
            subset[idx] = X[indices.get(i)];
        }
        return subset;
    }

    private static double[][] subset(double[][] X, List<Integer> indices, int start, int end) {
        double[][] subset = new double[end - start][X[0].length];
        for (int i = start; i < end; i++) {
            subset[i - start] = X[indices.get(i)];
        }
        return subset;
    }

    private static int[] subset(int[] y, List<Integer> indices, int start1, int end1, int start2, int end2) {
        int[] subset = new int[end1 - start1 + end2 - start2];
        int idx = 0;
        for (int i = start1; i < end1; i++, idx++) {
            subset[idx] = y[indices.get(i)];
        }
        for (int i = start2; i < end2; i++, idx++) {
            subset[idx] = y[indices.get(i)];
        }
        return subset;
    }

    private static int[] subset(int[] y, List<Integer> indices, int start, int end) {
        int[] subset = new int[end - start];
        for (int i = start; i < end; i++) {
            subset[i - start] = y[indices.get(i)];
        }
        return subset;
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
    //calculate the accuracy to evaluate the model on the test data
    static double calculateAccuracy(int[] actualLabels, int[] predictedLabels) {
        int correctCount = 0;
        for (int i = 0; i < actualLabels.length; i++) {
            if (actualLabels[i] == predictedLabels[i]) {
                correctCount++;
            }
        }
        return (double) correctCount / actualLabels.length;
    }
}