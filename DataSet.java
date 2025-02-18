package DataLayer;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DataSet {
    private List<List<String>> data;
    private List<String> headers;
    private List<List<String>> trainData = new ArrayList<>();
    private List<List<String>> testData = new ArrayList<>();


    public DataSet(String fileName) {
        this.data = new ArrayList<>();
        loadCsv(fileName);
    }
    //to load the main file
    private void loadCsv(String fileName) {
        try (BufferedReader br = new BufferedReader(new FileReader(fileName))) {
            String line;
            headers = new ArrayList<>();
            if ((line = br.readLine()) != null) {
                String[] header = line.split(",");
                for (String h : header) {
                    headers.add(h.trim());
                }
            }
            while ((line = br.readLine()) != null) {
                List<String> values = new ArrayList<>();
                String[] row = line.split(",");
                for (String field : row) {
                    values.add(field.trim());
                }
                data.add(values);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    //getter and setter for more usage later in the layer
    public void setData(List<List<String>> data) {
        this.data = data;
    }
    public void setHeaders(List<String> headers) {
        this.headers = headers;
    }

    public List<String> getHeaders() {
        return headers;
    }
    public List<List<String>> getData() {
        return data;
    }
    public List<List<String>> getTrainData() {
        return trainData;
    }


    public List<List<String>> getTestData() {
        return testData;
    }

    //main impuation function
    public void imputeData() {
        // Validate that each row has the same number of columns as the headers
        for (List<String> row : data) {
            if (row.size() != headers.size()) {
                throw new IllegalStateException("Row size does not match header size.");
            }
        }

        // Perform imputation
        for (int i = 0; i < headers.size(); i++) {
            if (isNumericColumn(i)) {
                imputeNumericColumn(i);
            } else {
                imputeCategoricalColumn(i);
            }
        }
    }
    //helper function
    // impute Numeric column by calculating the mean
    private void imputeNumericColumn(int columnIndex) {
        double sum = 0;
        int count = 0;

        for (List<String> row : data) {
            if (columnIndex < row.size() && !row.get(columnIndex).isEmpty()) {
                sum += Double.parseDouble(row.get(columnIndex));
                count++;
            }
        }
        double mean = count > 0 ? sum / count : 0;

        // Replace empty values with the calculated mean
        for (List<String> row : data) {
            if (columnIndex < row.size() && row.get(columnIndex).isEmpty()) {
                row.set(columnIndex, String.valueOf(mean));
            }
        }
    }
    //helper function
    //  impute Numeric column by counting the frequency of each value in the column
    private void imputeCategoricalColumn(int columnIndex) {
        Map<String, Integer> frequency = new HashMap<>();

        
        for (List<String> row : data) {
            if (columnIndex < row.size() && !row.get(columnIndex).isEmpty()) {
                String value = row.get(columnIndex);
                frequency.put(value, frequency.getOrDefault(value, 0) + 1);
            }
        }

        // Find the mode (most frequent value)
        String mode = null;
        int maxFreq = 0;
        for (Map.Entry<String, Integer> entry : frequency.entrySet()) {
            if (entry.getValue() > maxFreq) {
                mode = entry.getKey();
                maxFreq = entry.getValue();
            }
        }

        // Replace empty values with the mode
        for (List<String> row : data) {
            if (columnIndex < row.size() && row.get(columnIndex).isEmpty()) {
                row.set(columnIndex, mode != null ? mode : ""); // Use an empty string if there's no mode
            }
        }
    }
    //helper function
    // Check if the column contains numeric data
    private boolean isNumericColumn(int columnIndex) {
        
        for (List<String> row : data) {
            if (columnIndex < row.size()) {
                try {
                    Double.parseDouble(row.get(columnIndex));
                    return true; // If any value is numeric, assume the column is numeric
                } catch (NumberFormatException e) {
                    return false; // Non-numeric value found
                }
            }
        }
        return false;
    }
    //to split the data into seperate file to future usage
    public void splitData(double trainRatio) {
        Collections.shuffle(data);
        int total = data.size();
        int trainEnd = (int) (total * trainRatio);
        int testStart = trainEnd; // Start testing set right after training set ends

        trainData = new ArrayList<>(data.subList(0, trainEnd));
        testData = new ArrayList<>(data.subList(testStart, total));

        saveDataToFile(trainData, "C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\train_data.csv");
        saveDataToFile(testData, "C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\test_data.csv");
    }

    //save the data in the files after splitting
    private void saveDataToFile(List<List<String>> dataSet, String fileName) {
        try (BufferedWriter bw = new BufferedWriter(new FileWriter(fileName))) {
            bw.write(String.join(",", headers));
            bw.newLine();
            for (List<String> row : dataSet) {
                bw.write(String.join(",", row));
                bw.newLine();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
    	//Just for operating the splitting and the imputaion
        DataSet ds = new DataSet("C:\\Users\\Admin\\eclipse-workspace\\RandomForest\\src\\DataLayer\\DataFile (updated).csv");
        ds.imputeData(); // Impute missing values
        ds.splitData(0.70); // 70% training, 30% testing
    }
}
