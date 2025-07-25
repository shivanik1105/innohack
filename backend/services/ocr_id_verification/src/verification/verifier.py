import re
from datetime import datetime
from typing import Any # Import Any for more flexible type hinting

class IdVerifier:
    """
    Verifies the structured data extracted from an ID card.
    """

    def _is_valid_name(self, name: Any) -> bool:
        """
        Checks if the name is a non-empty string with some length.
        Safely handles non-string inputs.
        """
        # This check now correctly handles the case where name is None
        if not isinstance(name, str):
            return False
        return len(name.strip()) > 2

    def _is_valid_dob(self, dob: Any) -> bool:
        """
        Checks if the date of birth is in the correct format (DD/MM/YYYY).
        Safely handles non-string inputs.
        """
        if not isinstance(dob, str):
            return False
        try:
            datetime.strptime(dob, '%d/%m/%Y')
            return True
        except ValueError:
            return False

    def _is_valid_id_number(self, id_number: Any) -> bool:
        """
        Checks if the ID number follows the Aadhaar format.
        Safely handles non-string inputs.
        """
        if not isinstance(id_number, str):
            return False
        # Regex for 'XXXX XXXX XXXX' format
        return bool(re.fullmatch(r'\d{4}\s\d{4}\s\d{4}', id_number))

    def verify_id_data(self, id_data: dict) -> tuple[bool, list]:
        """
        Public method to verify the entire ID data dictionary.
        Returns a boolean for overall validity and a list of failed checks.
        """
        failed_checks = []
        
        # Now these calls are safe, as the functions handle the possibility of .get() returning None
        if not self._is_valid_name(id_data.get("name")):
            failed_checks.append("Name is missing or invalid.")
            
        if not self._is_valid_dob(id_data.get("date_of_birth")):
            failed_checks.append("Date of Birth is missing or in the wrong format.")
            
        if not self._is_valid_id_number(id_data.get("id_number")):
            failed_checks.append("ID Number is missing or not in the correct format.")
            
        is_valid = len(failed_checks) == 0
        
        return is_valid, failed_checks
