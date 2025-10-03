# Medical Visit Request System

## Overview

The Medical Visit Request System is a comprehensive solution for managing employee medical visit requests in the OSHapp application. It provides a complete workflow from request submission to confirmation, with notifications and email communications.

## Features

### ✅ Implemented Features

1. **Complete Backend Infrastructure**
   - MedicalVisitRequest entity with all necessary fields
   - MedicalVisitProposal entity for tracking proposed slots
   - MedicalVisitStatus enum for status management
   - Comprehensive DTOs for data transfer
   - Repository with optimized queries
   - Service layer with business logic
   - REST API controller with all endpoints

2. **Enhanced Notification System**
   - Medical staff notifications for new requests
   - Employee notifications for proposals and confirmations
   - Response notifications for medical staff
   - Integration with existing notification system

3. **Email Communication System**
   - Professional HTML email templates
   - Request confirmation emails
   - Proposal notification emails
   - Confirmation emails
   - Branded with OSHapp styling

4. **Frontend Integration**
   - API functions for all operations
   - TypeScript interfaces for type safety
   - Updated medical visit request form
   - Enhanced MedicalVisitStatus component
   - Real-time data integration

5. **Database Schema**
   - Optimized table structure
   - Proper foreign key relationships
   - Indexes for performance
   - Migration script included

## Architecture

### Backend Components

```
OSHapp/src/main/java/com/ohse/OSHapp/
├── model/
│   ├── MedicalVisitRequest.java          # Main entity
│   ├── MedicalVisitProposal.java         # Proposal tracking
│   ├── MedicalVisitRequestDTO.java       # Data transfer objects
│   └── enums/
│       └── MedicalVisitStatus.java       # Status enum
├── repository/
│   └── MedicalVisitRequestRepository.java # Data access
├── service/
│   ├── MedicalVisitRequestService.java   # Service interface
│   └── impl/
│       └── MedicalVisitRequestServiceImpl.java # Business logic
└── controller/
    └── MedicalVisitRequestController.java # REST API
```

### Frontend Components

```
UI-OHSapp/
├── lib/
│   └── api.ts                           # API functions & types
├── components/
│   └── medical-visit-status.tsx         # Status display component
└── app/
    └── demande-visite-medicale/
        └── page.tsx                     # Request form page
```

## API Endpoints

### Medical Visit Requests

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| POST | `/api/v1/medical-visits` | Create new request | SALARIE |
| GET | `/api/v1/medical-visits/{id}` | Get request by ID | All roles |
| GET | `/api/v1/medical-visits/employee/{employeeId}` | Get employee requests | All roles |
| GET | `/api/v1/medical-visits/pending` | Get pending requests | Medical staff |
| GET | `/api/v1/medical-visits/status/{status}` | Get requests by status | Medical staff |
| POST | `/api/v1/medical-visits/{id}/propose` | Propose slot | Medical staff |
| POST | `/api/v1/medical-visits/{id}/confirm` | Confirm request | Medical staff |
| POST | `/api/v1/medical-visits/{id}/reject` | Reject proposal | SALARIE |
| POST | `/api/v1/medical-visits/{id}/cancel` | Cancel request | All roles |
| POST | `/api/v1/medical-visits/{id}/assign` | Assign medical staff | HSE/RH/ADMIN |
| GET | `/api/v1/medical-visits/medical-staff` | Get staff requests | Medical staff |
| GET | `/api/v1/medical-visits/stats/count` | Get request counts | Medical staff |
| GET | `/api/v1/medical-visits/stats/urgent-count` | Get urgent counts | Medical staff |

## Data Models

### MedicalVisitRequest
```java
{
  id: Long,
  employeeId: Long,
  employeeName: String,
  employeeDepartment: String,
  motif: String,
  dateSouhaitee: LocalDate,
  heureSouhaitee: String,
  urgent: Boolean,
  status: MedicalVisitStatus,
  proposedDate: LocalDate?,
  proposedTime: String?,
  confirmedDate: LocalDate?,
  confirmedTime: String?,
  notes: String?,
  assignedNurseId: Long?,
  assignedNurseName: String?,
  assignedDoctorId: Long?,
  assignedDoctorName: String?,
  previousProposals: List<MedicalVisitProposal>,
  createdAt: LocalDateTime,
  updatedAt: LocalDateTime
}
```

### MedicalVisitStatus Enum
- `PENDING` - Request submitted, awaiting review
- `PROPOSED` - Slot proposed to employee
- `CONFIRMED` - Request confirmed and scheduled
- `CANCELLED` - Request cancelled
- `REJECTED` - Request rejected

## Workflow

### 1. Request Submission
1. Employee fills out medical visit request form
2. System creates request with PENDING status
3. Medical staff receives notification
4. Employee receives confirmation email

### 2. Request Processing
1. Medical staff reviews request
2. Staff can propose alternative slots
3. Employee receives proposal notification
4. Employee can accept or reject proposal

### 3. Confirmation
1. Medical staff confirms final slot
2. Employee receives confirmation email
3. Request status updated to CONFIRMED

## Setup Instructions

### 1. Database Migration
```sql
-- Run the migration script
source OSHapp/add_medical_visit_tables.sql
```

### 2. Backend Configuration
The system is automatically configured with Spring Boot. Ensure:
- JPA auditing is enabled
- Email service is configured
- Notification service is active

### 3. Frontend Configuration
The frontend automatically integrates with the new API. Ensure:
- API base URL is configured
- Authentication is working
- User roles are properly set

## Usage Examples

### Creating a Request (Frontend)
```typescript
import { medicalVisitAPI } from '@/lib/api'

const requestData = {
  motif: "Contrôle médical annuel",
  dateSouhaitee: "2024-02-15",
  heureSouhaitee: "14:30",
  urgent: false,
  notes: "Visite de routine"
}

const response = await medicalVisitAPI.createRequest(requestData, employeeId)
```

### Proposing a Slot (Backend)
```java
ProposeSlotDTO proposal = ProposeSlotDTO.builder()
    .proposedDate(LocalDate.of(2024, 2, 16))
    .proposedTime("10:00")
    .reason("Créneau plus adapté disponible")
    .proposedBy("Dr. Martin")
    .build();

medicalVisitRequestService.proposeSlot(requestId, proposal);
```

## Security

- Role-based access control for all endpoints
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention through JPA
- XSS protection in email templates

## Performance

- Optimized database queries with indexes
- Lazy loading for related entities
- Pagination support for large datasets
- Caching considerations for frequently accessed data

## Monitoring

- Comprehensive logging throughout the system
- Error tracking and reporting
- Performance metrics collection
- Audit trail for all operations

## Future Enhancements

1. **Calendar Integration**
   - Google Calendar/Outlook integration
   - Automated scheduling
   - Conflict detection

2. **Advanced Notifications**
   - SMS notifications
   - Push notifications
   - Reminder system

3. **Reporting & Analytics**
   - Request statistics dashboard
   - Trend analysis
   - Performance metrics

4. **Mobile App**
   - Native mobile application
   - Offline capability
   - Push notifications

## Troubleshooting

### Common Issues

1. **Email Not Sending**
   - Check email service configuration
   - Verify SMTP settings
   - Check firewall rules

2. **Notifications Not Working**
   - Verify notification service is running
   - Check user permissions
   - Review notification settings

3. **Database Connection Issues**
   - Verify database credentials
   - Check connection pool settings
   - Review migration status

### Debug Mode
Enable debug logging by setting:
```properties
logging.level.com.ohse.OSHapp=DEBUG
```

## Support

For technical support or questions about the Medical Visit Request System, please contact:
- **Email**: support@ohse.com
- **Documentation**: [Internal Wiki]
- **Issue Tracking**: [JIRA Project]

---

**Version**: 1.0.0  
**Last Updated**: February 2024  
**Maintainer**: OHSE Development Team 