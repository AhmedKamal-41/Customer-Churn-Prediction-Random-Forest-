package DataLayer;

import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class DataSetTest {

    private DataSet dataSet;

    @Before
    public void setUp() {
        dataSet = new DataSet("C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\DataFile (updated).csv");
        // Prepare headers and data for tests


        List<List<String>> data = new ArrayList<>();
        for (int i = 0; i < 100; i++) {
            data.add(new ArrayList<>(Arrays.asList("1", "2", "3")));
        }
        dataSet.setData(data);
    }

    @Test
    public void testSplitData() {
        dataSet.splitData(0.70); // Split with 70% training, 15% testing

        assertEquals("Training data size should be 70", 70, dataSet.getTrainData().size());
        assertEquals("Testing data size should be 15", 30, dataSet.getTestData().size());
    }

    @Test
    public void testImputation() {
        // Prepare headers and data with missing values
        List<String> headers = Arrays.asList("NumericColumn", "CategoricalColumn", "AnotherNumericColumn");
        dataSet.setHeaders(headers);

        List<List<String>> data = new ArrayList<>();
        data.add(new ArrayList<>(Arrays.asList("", "A", "10"))); // Missing numeric value
        data.add(new ArrayList<>(Arrays.asList("20", "", "30"))); // Missing categorical value
        data.add(new ArrayList<>(Arrays.asList("", "A", "")));    // Missing numeric values
        dataSet.setData(data);

        dataSet.imputeData(); //test imputation


        // Assertions for CategoricalColumn
        assertEquals("CategoricalColumn missing values should be replaced by the mode", "A", dataSet.getData().get(1).get(1));

        // Assertions for AnotherNumericColumn
        assertEquals("AnotherNumericColumn missing values should be replaced by the mean", "20.0", dataSet.getData().get(2).get(2));

        // Ensure no empty values remain
        for (List<String> row : dataSet.getData()) {
            for (String value : row) {
                assertFalse("No value should be empty after imputation", value.isEmpty());
            }
        }
    }
}

