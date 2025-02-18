package ModelLayer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Arrays;
import java.util.Map;
import java.util.Random;

public class RandomForestModelTestCases {

    private DecisionTree tree;
    private RandomForest forest;
    private double[][] X_train;
    private int[] y_train;
    @BeforeEach
    public void setup() {
        // Initalize 
        tree = new DecisionTree(5, 2, 2);
        tree.setRandom(new Random(123));
        forest = new RandomForest(10, 5, 2, 2);
        X_train = new double[][]{{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}, {7.0, 8.0}, {9.0, 10.0}};
        y_train = new int[]{0, 1, 0, 1, 0};

    }
    /******************************************************/
    //DecisionTree Class Test Cases
    @Test
    public void testInitialization() {
        assertNotNull(tree, "DecisionTree object should not be null after initialization");
    }

    @Test
    public void testFit() {
        // Setup data
        double[][] X = {{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}};
        int[] y = {0, 1, 0};

        // Execute
        tree.fit(X, y);

        // Verify
        assertNotNull(tree, "Tree should be trained successfully");
        // Check more properties or outcomes as needed, such as properties of the root node if exposed
    }

    @Test
    public void testPredict() {
        double[][] X = {{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}};
        int[] y = {0, 1, 0};

        tree.fit(X, y);
        int[] predictions = tree.predict(X);

        assertArrayEquals(y, predictions, "Predictions should match the actual labels");
    }

    @Test
    public void testPredictWithUnseenData() {
        double[][] X = {{1.0, 2.0}, {3.0, 4.0}, {5.0, 6.0}};
        int[] y = {0, 1, 0};
        double[][] X_unseen = {{2.0, 3.0}, {4.0, 5.0}};

        tree.fit(X, y);
        int[] predictions = tree.predict(X_unseen);

        // Example assertion, depending on expected behavior
        assertEquals(X_unseen.length, predictions.length, "Should predict labels for all unseen instances");
    }

    @Test
    public void testLeafNode() {
        Node leafNode = new Node(1); 
        assertTrue(leafNode.isLeafNode(), "Node should be identified as a leaf node");
        assertEquals(1, leafNode.value, "Leaf node value should match the expected label");
    }
    
    
    /******************************************************/
    //Random Forest Class Test Cases
    @Test
    public void testBiasInPredictionAccuracy() {
        double[][] X = {{1.0, 2.0}, {1.0, 3.0}, {0.0, 1.0}, {0.0, 4.0}, {0.0, 6.0}};
        int[] y = {0, 0, 1, 1, 1};

        forest.fit(X, y);

        double[][] group0X = {{0.0, 1.0}, {0.0, 4.0}, {0.0, 6.0}};
        int[] group0Y = {1, 1, 1};
        int[] group0Predictions = forest.predict(group0X);
        double group0Accuracy = calculateAccuracy(group0Predictions, group0Y);

        double[][] group1X = {{1.0, 2.0}, {1.0, 3.0}};
        int[] group1Y = {0, 0};
        int[] group1Predictions = forest.predict(group1X);
        double group1Accuracy = calculateAccuracy(group1Predictions, group1Y);

        assertTrue(group0Accuracy > 0.8, "Group 0 should have high accuracy");
        assertTrue(group1Accuracy > 0.8, "Group 1 should have high accuracy");
    }

    @Test
    public void testOverfitting() {
        double[][] X = {{1.0, 2.0}, {2.0, 3.0}, {3.0, 1.0}, {5.0, 4.0}, {4.0, 6.0}};
        int[] y = {0, 0, 1, 1, 1};

        forest.fit(X, y);
        int[] predictions = forest.predict(X);

        assertTrue(Arrays.equals(predictions, y), "Overfitting Test should pass with perfect accuracy");
    }

    @Test
    public void testBootstrappingValidation() {
        double[][] X = {{1.0, 2.0}, {2.0, 3.0}, {3.0, 1.0}, {5.0, 4.0}, {4.0, 6.0}};
        int[] y = {0, 0, 1, 1, 1};

        Map<String, Object> bootstrappedData = forest.bootstrap(X, y);
        double[][] bootstrappedX = (double[][]) bootstrappedData.get("X");
        int[] bootstrappedY = (int[]) bootstrappedData.get("y");

        assertEquals(X.length, bootstrappedX.length, "Bootstrapped X should have the same length as input X");
        assertEquals(y.length, bootstrappedY.length, "Bootstrapped Y should have the same length as input Y");
    }

    private double calculateAccuracy(int[] predictions, int[] trueValues) {
        int correctCount = 0;
        for (int i = 0; i < predictions.length; i++) {
            if (predictions[i] == trueValues[i]) {
                correctCount++;
            }
        }
        return (double) correctCount / predictions.length;
    }
    /******************/
    //Test on the k-validation from evalution class
    @Test
    public void testCrossValidationAccuracy() 
    {
        int k = 5;
        double result = Evaluation.crossValidation(X_train, y_train, k);
        assertTrue(result >= 0.0, "Cross-validation should calculate a non-negative accuracy");
    }

}
    

